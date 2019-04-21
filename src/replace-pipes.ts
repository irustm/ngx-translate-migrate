import { ElementAst } from '@angular/compiler';
import { DirectiveSymbol } from 'ngast';
import { getPipeAst, PipeBoundText } from './utils/pipe-ast';
import { readFileSync, writeFileSync } from 'fs';
import { CliConfig } from './models/models';
import { nodeToRange, getTextFromRange } from './utils/node-range';


export function replacePipes(allDirectives: DirectiveSymbol[], config: CliConfig): void {
  const translates = getTranslatesSync(config.filePath);
  allDirectives.forEach(el => {
    let url = null;
    try {
      if (el.isComponent()) {
        let translatePipes: PipeBoundText[] = [];
        url = el.getResolvedMetadata().templateUrl || el.symbol.filePath;
        el.getTemplateAst().templateAst.forEach(element => {
          translatePipes.push(...getPipeAst(element as ElementAst, 'translate'));
        });

        let replaces: { from: string; to: string }[] = translatePipes.map(pipe => {
          // get all pipes in one textBound source
          let replaceResult = pipe.source;
          pipe.pipeValues.forEach(pipeValue => {
            const text = getParamWithString(translates, pipeValue.value);
            if(text){
              const replace = `{{[\\s*]?'${pipeValue.value}'[\\s+]?\\|?\\s?\\w*\\s?}}`;
              replaceResult = replaceResult.replace(new RegExp(replace, 'g'), text.trim());
            } else {
              console.warn(`translate for pipe: ${pipeValue.value} not found`);
            }
          });
          if(replaceResult !== pipe.source){
            const translateVars = `${pipe.pipeValues.map(el => el.value).join(',')}`;
            const range = nodeToRange(pipe.parentNode);
            const from = getTextFromRange(pipe.parentNode.sourceSpan.start.file.content, range[0], range[1]);
            
            // add i18n attrubute
            let to = from.replace(`<${pipe.parentNode.name}`, `<${pipe.parentNode.name} i18n="${translateVars}"`);
            // replace content
            to = to.replace(pipe.source, replaceResult);

            return {
              from,
              to
            };
          } else {
            return null;
          }
        });
        let sourceCode = readFileSync(url).toString();
        replaces = replaces.filter(Boolean);
        sourceCode = replacizeText(sourceCode, replaces);
        
        if (sourceCode !== null) {
          writeFileSync(url, sourceCode);
        }
      } else {
        // Directive
      }
    } catch (e) {
      // Component
      // exception only componentß
      // console.log(url);
      console.error(e);
    }
  });
}

function getTranslatesSync(path: string): JSON {
  return JSON.parse(readFileSync(path).toString());
}

function getParamWithString(obj: JSON, value: string): string {
  const result = null;
  if (!value) return;
  const params = value.split('.');
  if (params.length === 1) {
    return obj[params[0]];
  } else {
    if (obj[params[0]]) {
      return getParamWithString(obj[params[0]], params.slice(1).join('.'));
    }
  }
  return result;
}
function replacizeText(sourceCode: string, replaces: { from: string; to: string }[]): string {
  let result = sourceCode;
  replaces.forEach(replacer => {
    result = result.replace(replacer.from, replacer.to);
  });
  return result;

}