import { _Renderer } from './Renderer.ts';
import { _TextRenderer } from './TextRenderer.ts';
import { _defaults } from './defaults.ts';
import type { MarkedToken, Token, Tokens } from './Tokens.ts';
import type { MarkedOptions } from './MarkedOptions.ts';

/**
 * Parsing & Compiling
 */
export class _Parser<ParserOutput = string[], RendererOutput = string | { children?: unknown[] }> {
  options: MarkedOptions<ParserOutput, RendererOutput>;
  renderer: _Renderer<ParserOutput, RendererOutput>;
  textRenderer: _TextRenderer<RendererOutput>;
  constructor(options?: MarkedOptions<ParserOutput, RendererOutput>) {
    this.options = options || _defaults;
    this.options.renderer = this.options.renderer || new _Renderer<ParserOutput, RendererOutput>();
    this.renderer = this.options.renderer;
    this.renderer.options = this.options;
    this.renderer.parser = this as _Parser<ParserOutput, RendererOutput>;
    this.textRenderer = new _TextRenderer<RendererOutput>();
  }

  /**
   * Static Parse Method
   */
  static parse<ParserOutput = string, RendererOutput = string>(tokens: Token[], options?: MarkedOptions<ParserOutput, RendererOutput>) {
    const parser = new _Parser<ParserOutput, RendererOutput>(options);
    return parser.parse(tokens);
  }

  /**
   * Static Parse Inline Method
   */
  static parseInline<ParserOutput = string, RendererOutput = string>(tokens: Token[], options?: MarkedOptions<ParserOutput, RendererOutput>) {
    const parser = new _Parser<ParserOutput, RendererOutput>(options);
    return parser.parseInline(tokens);
  }

  /**
   * Parse Loop
   */
  parse(tokens: Token[], top = true): ParserOutput {
    const out:(RendererOutput | string)[] = []
    // let out = '';

    for (let i = 0; i < tokens.length; i++) {
      const anyToken = tokens[i];

      // Run any renderer extensions
      if (this.options.extensions?.renderers?.[anyToken.type]) {
        const genericToken = anyToken as Tokens.Generic;
        const ret = this.options.extensions.renderers[genericToken.type].call({ parser: this }, genericToken);
        if (ret !== false || !['space', 'hr', 'heading', 'code', 'table', 'blockquote', 'list', 'html', 'paragraph', 'text'].includes(genericToken.type)) {
          // out += ret || '';
          out.push(ret || '');
          continue;
        }
      }

      const token = anyToken as MarkedToken;

      switch (token.type) {
        case 'space': {
          // out += this.renderer.space(token);
          // out.push(this.renderer.space(token));
          const rendered = this.renderer.space(token);
          if (rendered) {
            out.push(rendered)
          }
          continue;
        }
        case 'hr': {
          // out += this.renderer.hr(token);
          // out.push(this.renderer.hr(token));
          const rendered = this.renderer.hr(token);
          if (rendered) {
            out.push(rendered)
          }
          continue;
        }
        case 'heading': {
          // out += this.renderer.heading(token);
          // out.push(this.renderer.heading(token));
          const rendered = this.renderer.heading(token);
          if (rendered) {
            out.push(rendered)
          }
          continue;
        }
        case 'code': {
          // out += this.renderer.code(token);
          // out.push(this.renderer.code(token));
          const rendered = this.renderer.code(token);
          if (rendered) {
            out.push(rendered)
          }
          continue;
        }
        case 'table': {
          // out += this.renderer.table(token);
          // out.push(this.renderer.table(token));
          const rendered = this.renderer.table(token);
          if (rendered) {
            out.push(rendered)
          }
          continue;
        }
        case 'blockquote': {
          // out += this.renderer.blockquote(token);
          // out.push(this.renderer.blockquote(token));
          const rendered = this.renderer.blockquote(token) as { children: RendererOutput[] }
          if (rendered?.children?.length) {
            for (const r of rendered?.children) {
              out.push(r)
            }
          }
          // const rendered = this.renderer.blockquote(token);
          // console.log('rendered', rendered)
          // if (rendered) {
          //   out.push(rendered)
          // }
          continue;
        }
        case 'list': {
          // out += this.renderer.list(token);
          // out.push(this.renderer.list(token));
          const rendered = this.renderer.list(token);
          if (rendered) {
            out.push(rendered)
          }
          continue;
        }
        case 'html': {
          // out += this.renderer.html(token);
          // out.push(this.renderer.html(token));
          const rendered = this.renderer.html(token);
          if (rendered) {
            out.push(rendered)
          }
          continue;
        }
        case 'paragraph': {
          // out += this.renderer.paragraph(token);
          // out.push(this.renderer.paragraph(token));
          const rendered = this.renderer.paragraph(token);
          if (rendered) {
            out.push(rendered)
          }
          continue;
        }
        case 'text': {
          let textToken = token;
          let body = this.renderer.text(textToken) as string;
          while (i + 1 < tokens.length && tokens[i + 1].type === 'text') {
            textToken = tokens[++i] as Tokens.Text;
            body += ('\n' + this.renderer.text(textToken));
          }
          if (top) {
            // out += this.renderer.paragraph({
            //   type: 'paragraph',
            //   raw: body,
            //   text: body,
            //   tokens: [{ type: 'text', raw: body, text: body, escaped: true }],
            // });
            out.push(this.renderer.paragraph({
              type: 'paragraph',
              raw: body,
              text: body,
              tokens: [{ type: 'text', raw: body, text: body, escaped: true }],
            }));
          } else {
            // out += body;
            out.push(body);
          }
          continue;
        }

        default: {
          const errMsg = 'Token with "' + token.type + '" type was not found.';
          if (this.options.silent) {
            console.error(errMsg);
            return '' as ParserOutput;
          } else {
            throw new Error(errMsg);
          }
        }
      }
    }

    return out as ParserOutput;
  }

  /**
   * Parse Inline Tokens
   */
  parseInline(tokens: Token[], renderer: _Renderer<ParserOutput, RendererOutput> | _TextRenderer<RendererOutput> = this.renderer): ParserOutput {
    const out:(RendererOutput | string)[] = []
    // let out = '';

    for (let i = 0; i < tokens.length; i++) {
      const anyToken = tokens[i];
      // Run any renderer extensions
      if (this.options.extensions?.renderers?.[anyToken.type]) {
        const ret = this.options.extensions.renderers[anyToken.type].call({ parser: this }, anyToken);
        if (ret !== false || !['escape', 'html', 'link', 'image', 'strong', 'em', 'codespan', 'br', 'del', 'text'].includes(anyToken.type)) {
          // out += ret || '';
          out.push(ret || '');
          continue;
        }
      }

      const token = anyToken as MarkedToken;

      switch (token.type) {
        case 'escape': {
          // out += renderer.text(token);
          // out.push(renderer.text(token));
          const rendered = renderer.text(token);
          if (rendered) {
            out.push(rendered)
          }
          break;
        }
        case 'html': {
          // out += renderer.html(token);
          // out.push(renderer.html(token));
          const rendered = renderer.html(token);
          if (rendered) {
            out.push(rendered)
          }
          break;
        }
        case 'link': {
          // out += renderer.link(token);
          // out.push(renderer.link(token));
          const rendered = renderer.link(token);
          if (rendered) {
            out.push(rendered)
          }
          break;
        }
        case 'image': {
          // out += renderer.image(token);
          // out.push(renderer.image(token));
          const rendered = renderer.image(token);
          if (rendered) {
            out.push(rendered)
          }
          break;
        }
        case 'strong': {
          // out += renderer.strong(token);
          // out.push(renderer.strong(token));
          // const rendered = renderer.strong(token);
          // if (rendered) {
          //   out.push(rendered)
          // }
          const rendered = renderer.strong(token) as { children: RendererOutput[] }
          if (rendered?.children?.length) {
            for (const r of rendered?.children) {
              out.push(r)
            }
          }
          break;
        }
        case 'em': {
          // out += renderer.em(token);
          // out.push(renderer.em(token));
          const rendered = renderer.em(token) as { children: RendererOutput[] }
          if (rendered?.children?.length) {
            for (const r of rendered?.children) {
              out.push(r)
            }
          }
          break;
        }
        case 'codespan': {
          // out += renderer.codespan(token);
          // out.push(renderer.codespan(token));
          const rendered = renderer.codespan(token);
          if (rendered) {
            out.push(rendered)
          }
          break;
        }
        case 'br': {
          // out += renderer.br(token);
          // out.push(renderer.br(token));
          const rendered = renderer.br(token);
          if (rendered) {
            out.push(rendered)
          }
          break;
        }
        case 'del': {
          // out += renderer.del(token);
          // out.push(renderer.del(token));
          const rendered = renderer.del(token) as { children: RendererOutput[] }
          if (rendered?.children?.length) {
            for (const r of rendered?.children) {
              out.push(r)
            }
          }
          // const rendered = renderer.del(token);
          // if (rendered) {
          //   out.push(rendered)
          // }
          break;
        }
        case 'text': {
          // out += renderer.text(token);
          // out.push(renderer.text(token));
          const rendered = renderer.text(token);
          if (rendered) {
            out.push(rendered)
          }
          break;
        }
        default: {
          const errMsg = 'Token with "' + token.type + '" type was not found.';
          if (this.options.silent) {
            console.error(errMsg);
            return '' as ParserOutput;
          } else {
            throw new Error(errMsg);
          }
        }
      }
    }
    return out as ParserOutput;
  }
}
