import { html } from 'diff2html';
import 'diff2html/bundles/css/diff2html.min.css';

function DiffExample() {
  const diff = `diff --git a/file.js b/file.js
    index 1234567..89abcde 100644
    --- a/file.js
    +++ b/file.js
    @@ -1,3 +1,3 @@
    -const a = 1;
    +const a = 2;
    console.log(a);
    `;

  const diffHtml = html(diff, {
    drawFileList: true,
    matching: 'lines',
    outputFormat: 'line-by-line',
  });

  return <div dangerouslySetInnerHTML={{ __html: diffHtml }} />;
}

export default DiffExample;