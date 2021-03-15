export function GetData(type){
    let BaseUrl='http://localhost:5000/';
    console.log("running");
    return new Promise((resolve,reject)=>{
        fetch(BaseUrl+type,{
            method:'GET',
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