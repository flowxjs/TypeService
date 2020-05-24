import 'reflect-metadata';


const abc = (target: any, property: any, index: any) => {
console.log(target, property, index)
}

class aaaa {
  
  aaa(@abc aaa: any) {
    
  }
}