# Buffer ES

The node.js buffer module made by Feross is a super easy way to convert a
typedArray to a buffer that can be serialized with JSON.stringify.

This can be used together with `new FileReader()` and you can convert the result
to a buffer.

```
const reader = new FileReader();
reader.onload = function(event) {
  const result = event.target.result;
  const filebuffer = Buffer.from(result)
  console.log(JSON.stringify({ file: filebuffer }));
};
reader.readAsArrayBuffer(DOMNODE.files[0]);
```
