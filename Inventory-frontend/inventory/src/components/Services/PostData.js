export function PostData(type,userData){
    let BaseUrl='http://localhost:5000/';
    console.log("running");
    console.log(JSON.stringify(userData));
    return new Promise((resolve,reject)=>{
      fetch(BaseUrl+type,{
        method:'POST',
        headers:{'Content-Type': 'application/json'},
        body:JSON.stringify(userData)
      })
      .then((response)=>{
        console.log(response);
        return response.json();
      })
      .then((responseJson)=>{
        console.log(responseJson);
        resolve(responseJson);
      })
      .catch((error)=>{
        reject(error);
      });
    });
  }