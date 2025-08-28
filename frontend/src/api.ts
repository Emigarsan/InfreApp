export async function get<T>(url:string):Promise<T>{
  const res = await fetch(url);
  if(!res.ok) throw new Error('GET '+url+' failed');
  return res.json();
}
export async function post<T>(url:string, body:any):Promise<T>{
  const res = await fetch(url, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(body)
  });
  if(!res.ok) throw new Error('POST '+url+' failed');
  return res.json();
}
