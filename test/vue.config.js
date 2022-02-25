const path=require('path')
const glob=require('glob')
const resolve=(dir)=>path.join(__dirname, dir);

const getEntry=()=>{
    const entry={};
    const fileNameArr=glob.sync(resolve('./src/pages/**/*.html'))
        .map(p=>p.split('/src/pages/')[1])
        .map(p=>p.replace('.html', ''));
    fileNameArr.forEach(element => {
        entry[element]={
            entry:`./src/${element}.js`,
            template:`./src/pages/${element}.html`,
            fileName:`${element}.html`
        }
    });
    return entry;
}

module.exports={
    pages:getEntry(),
    devServer:{
        proxy:{
            '/api': {
                target: 'http://localhost:3000/',
                ChangeOrigin: true
            }
        }
    },
    configureWebpack:{
    }
}