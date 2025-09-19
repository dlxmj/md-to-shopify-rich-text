import { Marked, type MarkedExtension, type Tokens } from "marked";

function setBold(tokens: any[]) {
  for (const token of tokens) {
    if (token.type === "text") {
      token.bold = true;
      continue;
    }
    if (token.children?.length) {
      setBold(token.children);
    }
  }
}

function setItalic(tokens: any) {
  for (const token of tokens) {
    if (token.type === "text") {
      token.italic = true;
      continue;
    }
    if (token.children?.length) {
      setItalic(token.children);
    }
  }
}

export interface ShopifyRichTextOutput {
  type: string;
  value?: string;
  children?: ShopifyRichTextOutput[];
}

const shopifyExtension = {
  renderer: {
    // BLOCK -level renderer ~~~~~~~~~~~~~~~~~~~~~~~~~~
    space(token) {
      // console.log("token space", token);
      // const mappedToken = { mappedToken: token };
      // return {type: "text",value:"\n\n"}

      return { type: "paragraph", children: [{ type: "text", value: "" }] };
    },
    code(token) {
      // console.log("token code", token);
      // const mappedToken = { mappedToken: token };

      return { type: "text", value: token.text };
      // return this.text(token as Tokens.Text)
    },
    blockquote(token) {
      const parsed = this.parser.parse(token.tokens);
      // console.log("token blockquote", token);
      // console.log("tokens blockquote", token.tokens);
      // console.log("tokens link blockquote", parsed);
      return { type: "blockquote", children: parsed };
    },
    html(token) {
      return { type: "text", value: token.text };
      // console.log("token link", token);
      // const mappedToken = { mappedToken: token };
      // return null
    },
    heading(token) {
      const parsed = this.parser.parseInline(token.tokens);
      // console.log("token heading", token);
      // console.log("tokens heading", token.tokens);
      // console.log("tokens heading parsed", parsed);
      return { type: "heading", level: token.depth, children: parsed };
    },
    hr(token) {
      // console.log("token link", token);
      return null;
    },
    list(token) {
      // console.log("token list", token);
      // console.log("tokens list", token.items);
      // console.log("tokens list parsed", parsed);
      const children = token.items.flatMap((item) =>
        this.listitem(item)?.children?.map((ch) => ({
          type: "list-item",
          children: [ch],
        })),
      );
      return {
        type: "list",
        listType: token.ordered ? "ordered" : "unordered",
        children: children,
      };
    },
    listitem(item) {
      // const parsed = this.parser.parseInline(token.tokens);
      // console.log("token listitem", JSON.stringify(item,null,2));
      // console.log("tokens listitem", item.tokens);
      // console.log("tokens listitem parsed", parsed);
      const children = this.parser.parse(item.tokens, !!item.loose);

      // console.log("token listitem children", JSON.stringify(children,null,2));
      return {
        type: "list-item",
        children,
      };
    },
    checkbox(token) {
      // console.log("token checkbox", token);
      return null;
    },
    paragraph(token) {
      const parsed = this.parser.parseInline(token.tokens);
      // console.log("token paragraph", token);
      // console.log("tokens paragraph", token.tokens);
      // console.log("tokens paragraph parsed", parsed);

      return { type: "paragraph", children: parsed };
    },
    table(token) {
      // const parsed = this.parser.parseInline(token.tokens);
      // console.log("token table", token);
      // console.log("tokens table rows", token.rows);
      return null;
    },
    tablerow(token) {
      // console.log("token tablerow", token);
      // const mappedToken = { mappedToken: token };
      return null;
    },
    tablecell(token) {
      const parsed = this.parser.parseInline(token.tokens);
      // console.log("token tablecell", token);
      // console.log("tokens tablecell", token.tokens);
      // console.log("tokens tablecell parsed", parsed);
      // const mappedToken = { mappedToken: token };
      return null;
    },
    // Inline -level renderer ~~~~~~~~~~~~~~~~~~~~~~~~~~
    strong(token) {
      // console.log("token strong",JSON.stringify(token,null,2));
      const parsed = this.parser.parseInline(token.tokens);
      setBold(parsed);
      // for (const item of parsed) {
      //   console.log("item", item);
      //   if(item.type ==="text") {
      //     item.bold = true
      //   }
      // }
      // console.log("token strong", token);
      // console.log("tokens strong", token.tokens);
      // console.log("tokens strong parsed", parsed);
      return { type: "strong", children: parsed };
      // return parsed
      // return parsed
    },
    em(token) {
      // console.log("token em",JSON.stringify(token,null,2) );
      const parsed = this.parser.parseInline(token.tokens);
      setItalic(parsed);
      // console.log("token em", token);
      // console.log("tokens em", token.tokens);
      // console.log("tokens em parsed", parsed);
      return { type: "em", children: parsed };
      // return parsed
      // return parsed
    },
    codespan(token) {
      // console.log("token codespan", token);
      // const mappedToken = { mappedToken: token };
      return { type: "text", value: token.text };
    },

    br(token) {
      // console.log("token br", token);
      return { type: "paragraph", children: [{ type: "text", value: "" }] };
    },
    del(token) {
      // console.log("token del",JSON.stringify(token,null,2) );
      const parsed = this.parser.parseInline(token.tokens);
      // console.log("token del", token);
      // console.log("tokens del", token.tokens);
      // console.log("tokens del parsed", parsed);
      // const mappedToken = { mappedToken: token };
      return { type: "del", children: parsed };
      // return parsed
      // return parsed
    },
    link(token) {
      const parsed = this.parser.parseInline(token.tokens);
      // console.log("token link", token);
      // console.log("tokens link", token.tokens);
      // console.log("tokens link parsed", parsed);
      // const ssss = JSON.parse(parsed);
      return {
        url: token.href,
        type: "link",
        children: parsed,
      };
    },
    image(token) {
      // const parsed = this.parser.parseInline(token.tokens);
      // console.log("token image", token);
      // console.log("tokens image", token.tokens);
      // console.log("tokens image parsed", parsed);
      return null;
    },
    text(token: Tokens.Text) {
      // console.log("token text",JSON.stringify(token,null,2) );
      if (!token.tokens?.length) {
        return {
          type: "text",
          value: token.text,
        };
      }

      const parsed = this.parser.parseInline(token.tokens);
      return parsed[0];
    },
  },
} as MarkedExtension<ShopifyRichTextOutput[], ShopifyRichTextOutput | null>;

export async function parse(markdown: string) {
  const marked = new Marked(shopifyExtension);
  const tokens = await marked.parse(markdown);
  const shopifyRichText = { type: "root", children: tokens };
  removeIndents(shopifyRichText, 0);
  return shopifyRichText;
}

function removeIndents(
  token: ShopifyRichTextOutput,
  idx: number,
  parent?: ShopifyRichTextOutput,
) {
  switch (token.type) {
    case "root":
      if (token.children?.length) {
        for (const [i, childToken] of token.children.entries()) {
          // console.log(`case "root":`,i,JSON.stringify(childToken,null,2))
          if (removeIndents(childToken, i, token)) {
          }
        }
      }
      break;
    case "paragraph":
      if (["paragraph", "list-item"].includes(parent?.type || "")) {
        return true;
      } else if (token.children?.length) {
        let ri = 0;
        for (const [i, childToken] of token.children.entries()) {
          if (removeIndents(childToken, i, token)) {
            ri++;
            parent?.children?.splice(idx + ri, 0, childToken);
            //for further checking
            token.children?.splice(i, 1);
          }
        }
      }
      break;
    case "list":
      if (["paragraph", "list-item"].includes(parent?.type || "")) {
        // console.log(`case "list":["paragraph","list-item"].includes(parent?.type||"")`,parent,JSON.stringify(token,null,2))
        return true;
      } else if (token.children?.length) {
        let ri = 0;
        for (const [i, childToken] of token.children.entries()) {
          if (removeIndents(childToken, i, token)) {
            ri++;
            // console.log(`case "root":removeIndents`,idx)
            // console.log(`case "list":removeIndents`,parent,JSON.stringify(childToken,null,2))
            parent?.children?.splice(idx + ri, 0, childToken.children![0]!);
            //for further checking
            token.children?.splice(i, 1);
          }
        }
      }
      break;
    case "list-item":
      if (token.children?.length) {
        for (const [i, childToken] of token.children.entries()) {
          if (removeIndents(childToken, i, token)) {
            // console.log(`list-item)`,parent,token,childToken)
            return true;
          }
        }
        return false;
      }
      break;
    case "heading":
      if (["paragraph"].includes(parent?.type || "")) {
        return true;
      }
      return false;
    case "text":
    case "link":
      return false;
    default:
      return false;
  }
}
