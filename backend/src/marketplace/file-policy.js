// Conservative format checks; not malware scanning.
export function detectProjectFile(bytes,name){
 const ext=String(name).split('.').pop().toLowerCase();
 const starts=(a)=>a.every((v,i)=>bytes[i]===v);
 if(starts([255,216,255]))return 'jpg';
 if(starts([137,80,78,71,13,10,26,10]))return 'png';
 if(starts([37,80,68,70,45]))return 'pdf';
 if(ext==='csv'){
  try{const text=new TextDecoder('utf-8',{fatal:true}).decode(bytes);if(text.trim()&&!/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(text))return 'csv';}catch{}
 }
 // ZIP-family files remain opaque downloads; inspect central directory names.
 if(!['zip','docx','xlsx'].includes(ext)||!starts([80,75,3,4]))return null;
 const v=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);let end=-1;
 for(let i=bytes.length-22;i>=Math.max(0,bytes.length-65557);i--){if(v.getUint32(i,true)===0x06054b50&&i+22+v.getUint16(i+20,true)===bytes.length){end=i;break;}}
 if(end<0||v.getUint16(end+4,true)||v.getUint16(end+6,true))return null;
 const count=v.getUint16(end+10,true),size=v.getUint32(end+12,true),offset=v.getUint32(end+16,true);
 if(!count||count>2000||v.getUint16(end+8,true)!==count||offset+size!==end)return null;
 let p=offset,total=0;const names=new Set();
 for(let i=0;i<count;i++){
  if(p+46>end||v.getUint32(p,true)!==0x02014b50)return null;
  const flags=v.getUint16(p+8,true),n=v.getUint16(p+28,true),x=v.getUint16(p+30,true),c=v.getUint16(p+32,true);
  if(flags&1||p+46+n+x+c>end)return null;
  total+=v.getUint32(p+24,true);if(total>104857600)return null;
  const name=new TextDecoder().decode(bytes.subarray(p+46,p+46+n));
  if(!name||name.includes('\\')||name.startsWith('/')||/^[a-z]:/i.test(name)||name.split('/').includes('..')||names.has(name)||name.includes('\0'))return null;
  names.add(name);p+=46+n+x+c;
 }
 if(p!==end)return null;
 if(ext!=='zip'&&(!names.has('[Content_Types].xml')||!names.has(ext==='docx'?'word/document.xml':'xl/workbook.xml')||[...names].some(n=>/vbaProject\.bin$/i.test(n))))return null;
 return ext;
}
