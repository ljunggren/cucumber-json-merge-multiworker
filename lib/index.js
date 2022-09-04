"use strict";

const fs = require("fs");
const fspath = require("path");
const read = require("fs-readdir-recursive");
const mkdirp = require("mkdirp");

/**
 * List all JSON files in directory
 * @param {*} path
 * @param {*} recursive
 */
function listJsonFiles(path, recursive) {
  try {
    var allFiles = recursive ? read(path) : fs.readdirSync(path);
    var jsonFiles = allFiles
      .map(function(file) {
        return fspath.join(path, file);
      })
      // Fiter out non-files
      .filter(function(file) {
        return fs.statSync(file).isFile();
      })
      // Only return files ending in '.json'
      .filter(function(file) {
        return file.slice(-5) === ".json";
      });
    // No files returned
    if (!jsonFiles.length > 0) {
      return new Error("No json files found");
    } else {
      // Return the array of files ending in '.json'
      return jsonFiles;
    }
  } catch (e) {
    throw e;
  }
}
/*
function mergeFiles(files) {
  let mergedResults = [];
  files.forEach(function(file) {
    try {
      console.log("### File", file);
      let rawdata = fs.readFileSync(file);
      let partialResults = JSON.parse(rawdata);

      console.log("### Partial result", partialResults);
      console.log("### Feature name", partialResults[0].name);
      console.log("### Feature id", partialResults[0].id);
      
      
      
      mergedResults.push(partialResults);
    } catch (err) {
      if (err instanceof SyntaxError) {
        throw new Error("Invalid JSON content");
      } else {
        throw err;
      }
    }
  });
  return JSON.stringify(mergedResults.concat.apply([], mergedResults));
}
*/
function mergeFiles(files) {
  let mergedResults = {};
  files.forEach(function(file) {
    if(!file.match(/t[0-9]+-?[0-9]*\.json$/)){
      console.log("ignore: "+file)
      return
    }
    if(file.match(/t[0-9]+\.json/)){
      let f=file.replace(".json","-0.json")
      if(fs.existsSync(f)){
        console.log("ignore: "+file)
        return
      }
    }
    try {
      let rawdata = fs.readFileSync(file);
      let partialResults = JSON.parse(rawdata);

      partialResults.forEach(x => {
        if (!mergedResults[x.id]) {
          mergedResults[x.id] = x;
        } else {
          mergedResults[x.id].elements.push(...x.elements);
        }
      });
    } catch (err) {
      if (err instanceof SyntaxError) {
        throw new Error("Invalid JSON content");
      } else {
        throw err;
      }
    }
  });
  return JSON.stringify(Object.values(mergedResults));
}

function writeMergedFile(file, data, createOutputDir) {
  try {
    fs.writeFileSync(file, data);
  } catch (error) {
    if (error.code == "ENOENT") {
      if (createOutputDir) {
        mkdirp.sync(file.substr(0, file.lastIndexOf("/")));
        fs.writeFileSync(file, data);
      } else {
        throw new Error("Missing output directory");
      }
    }
  }
  buildSummary(data)
}

function buildSummary(data){
  console.log("build summary report ...")
  let summary={
        scenario:{
          total:0,
          failed:0
        },
        step:{
          total:0,
          failed:0,
          skipped:0,
          pending:0
        },
        issue:{
          app:{
          },
          auto:{
          },
          unknow:{
          },
          "":{
          }
        },
        workerMap:{}
      },
      slow=[],
      details=[];
  data = JSON.parse(data);
  data.forEach(feature=>{
    feature.elements.forEach(scenario=>{
      summary.scenario.total++
      details.push({
        start:scenario.extraData.start,
        end:scenario.extraData.end,
        worker:scenario.extraData.worker,
        id:scenario.extraData.id,
        name:scenario.extraData.name
      })
      summary.workerMap[scenario.extraData.worker]=1
      scenario.steps.forEach(step=>{
        summary.step.total++
        if(step.result.duration>300000000000){
          slow.push({
            duration:step.result.duration/100000000,
            desc:step.name
          })
        }
        if(step.result.status=="failed"){
          summary.step.failed++
          summary.scenario.failed++
          let d=scenario.extraData.rootCase
          let map=summary.issue[d.type||""];
          if(!map[d.errHash]){
            map[d.errHash]={
              total:0,
              desc:d.desc,
              scope:d.scope,
              errDesc:d.errDesc,
              url:d.url
            }
          }
          map[d.errHash].total++
        }else if(step.result.status=="skipped"){
          summary.step.skipped++
        }else{
          summary.step.pending++
        }
      })
    })
  });

  let issueHtml=Object.keys(summary.issue).map(x=>{
    let xd=summary.issue[x]
    if(!Object.keys(xd).length){
      return ""
    }
    let y= Object.keys(xd).map(h=>{
      let o=xd[h]
      return `<tr onClick='toggleRow(this)'>
  <td>${o.total}</td>
  <td>${h}</td>
  <td>${o.errDesc||""}</td>
  <td>${x}</td>
  <td>${o.scope||""}</td>
  <td>${o.url?"<a href='"+o.url+"' target='_blank'>- Go -</a>":""}</td>
  <td class="expanded-row-content hide-row">${o.desc}</td>
</tr>`
    }).join("")
    return y
  }).join("")||"No failed test case"
  
  let slowHtml=slow.map(x=>{
    return `<tr><td>${x.duration}</td><td>${x.desc}</td></tr>`
  }).join("")||"No slow test case"
  let detailHtml=details.map(x=>{
    return `<tr><td>${x.start}</td><td>${x.end}</td><td>${x.worker}</td><td>${x.id}</td><td>${x.name}</td></tr>`
  }).join("")

  try{
    let html=`<html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">  
      <style>
    html{font-family:sans-serif;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%}a{background-color:transparent}a:active,a:hover{outline:0}input{color:inherit;font:inherit;margin:0;line-height:normal}input[type=checkbox],input[type=radio]{box-sizing:border-box;padding:0}.container{position:relative;width:100%;max-width:1200px;margin:0 auto;padding:0 20px;box-sizing:border-box}.column,.columns{width:100%;float:left;box-sizing:border-box}@media (min-width:400px){.container{width:85%;padding:0}}@media (min-width:550px){.container{width:80%}.column,.columns{margin-left:4%}.column:first-child,.columns:first-child{margin-left:0}.one.column,.one.columns{width:4.66666666667%}.two.columns{width:13.3333333333%}.three.columns{width:22%}.four.columns{width:30.6666666667%}}html{font-size:62.5%}body{font-size:1.5em;line-height:1.6;font-weight:400;font-family:HelveticaNeue,"Helvetica Neue",Raleway,Helvetica,Arial,sans-serif;color:#222;margin:0}h1,h2,h3,h4,h5,h6{margin-top:0;margin-bottom:2rem;font-weight:300}h1{font-size:4rem;line-height:1.2;letter-spacing:-.1rem}h2{font-size:3.6rem;line-height:1.25;letter-spacing:-.1rem}h3{font-size:3rem;line-height:1.3;letter-spacing:-.1rem}h4{font-size:2.4rem;line-height:1.35;letter-spacing:-.08rem}h5{font-size:1.8rem;line-height:1.5;letter-spacing:-.05rem}h6{font-size:1.5rem;line-height:1.6;letter-spacing:0}@media (min-width:550px){h1{font-size:5rem}h2{font-size:4.2rem}h3{font-size:3.6rem}h4{font-size:3rem}h5{font-size:2.4rem}h6{font-size:1.5rem}}p{margin-top:0}td,th{padding:9px 15px;text-align:left;border-bottom:1px solid #e1e1e1}td:first-child,th:first-child{padding-left:5px}td:last-child,th:last-child{padding-right:5px}.button,button{margin-bottom:1rem}fieldset,input,select,textarea{margin-bottom:1.5rem}blockquote,dl,figure,form,ol,p,pre,table,ul{margin-bottom:2.5rem}.container:after,.row:after,.u-cf{content:"";display:table;clear:both}    
    
    .top_header{margin:7rem 0}.top_header .heading{font-size:3rem;color:#404159}.chart_section table,.tabs_section table{width:100%;border-collapse:collapse;border-spacing:0}.chart_section table tr,.tabs_section table tr{padding:.5rem .5rem}.chart_section table th,.tabs_section table th{color:rgba(43,44,59,.8);font-size:1.1rem;text-transform:uppercase}.chart_section{margin-bottom:6rem}.chart_section .table_area{margin-bottom:2rem}@media all and (min-width:768px){.chart_section .table_area{margin-bottom:0}}.chart_section .table_area.last_of-type{margin:0}.chart_section .table_area .table_header{border-top-right-radius:5px;border-top-left-radius:5px;padding:1.1rem 1rem}.chart_section .table_area .table_header h6{margin-bottom:0;font-weight:600;font-size:1.3rem}.chart_section .table_area .table_header.test{background:#f99fa0}.chart_section .table_area .table_header.steps{background:#fdcedc}.chart_section .table_area .table_header.issues{background:#ded0fb}.chart_section .table_area .table_header.workers{background:#b9dfd4}.chart_section .table_area th{padding:0 .9rem!important;width:70%}.chart_section .table_area td{font-size:1.4rem}.tabs_section{margin-bottom:6rem}.tabs_section tr:nth-of-type(even){background-color:rgba(0,0,0,.05)}.tabs_section tr td{font-size:1.3rem}footer{padding:2rem 0}footer .copy{font-size:1rem}.tabset>input[type=radio]{position:absolute;left:-200vw}.tab-panels>section{padding:1rem}.tabset .tab-panel{display:none;overflow-x:auto;white-space:nowrap}.tabset>input:first-child:checked~.tab-panels>.tab-panel:first-child,.tabset>input:nth-child(11):checked~.tab-panels>.tab-panel:nth-child(6),.tabset>input:nth-child(3):checked~.tab-panels>.tab-panel:nth-child(2),.tabset>input:nth-child(5):checked~.tab-panels>.tab-panel:nth-child(3),.tabset>input:nth-child(7):checked~.tab-panels>.tab-panel:nth-child(4),.tabset>input:nth-child(9):checked~.tab-panels>.tab-panel:nth-child(5){display:block}.tabset>label{position:relative;display:inline-block;padding:1.1rem 1rem;padding-right:3rem;cursor:pointer;font-weight:600;border-top-left-radius:5px;border-top-right-radius:5px;border-bottom:3px solid transparent;margin-bottom:-1px;transition:all .4s ease-in;width:80%;font-size:1.3rem}.tabset>label:hover{background-color:rgba(0,0,0,.05)}@media all and (min-width:768px){.tabset>label{width:auto}}.tabset>input:checked+label{border-color:#e1e1e1;border-bottom:1px solid #fff;border-bottom:3px solid #1183ee}.tab-panel{border-top:1px solid #e1e1e1}
    
    .expanded-row-content {white-space:pre; font-size: 12px !important; color: #777; border-top: none; display: grid; grid-column: 1/-1; font-size: 13px;} .hide-row { display: none;} #issuetable tr{cursor: pointer; display: grid; border-bottom: 1px solid #e1e1e1; grid-template-columns: 50px 300px 300px 100px 150px 100px;} #issuetable th,#issuetable td {border:none;} .chart_section td{float:right}
      </style>
      <script>
        const toggleRow = (element) => {
    
        let o=element.getElementsByClassName('expanded-row-content')[0]
        o.classList.toggle('hide-row');
    
        setTimeout(function(){
          if(!o.classList.contains("hide-row")){
            o.innerText=o.innerText.replace(/\\\\n/g,"\\n")
            o.innerText=o.innerText.replace(/\\\\\\"/g,"\\"")
          }
        },10)
      }
      </script>
      <title>Boozang - Test Execution Summary</title>
    </head>
    <body>
      <div class="container">
        <header class="top_header">
          <h1 class="heading">Test Execution Summary</h1>
        </header>
        <section class="chart_section">
          <div class="row">
            <div class="three columns">
              <article class="table_area">
                <header class="table_header test">
                  <h6>Summary</h6>
                </header>
                <table>
                  <thead></thead>
                  <tbody>
                    <tr>
                      <th>Total Scenarios</th>
                      <td>${summary.scenario.total}</td>
                    </tr>
                    <tr>
                      <th scope="row">Failed Scenarios</th>
                      <td>${summary.scenario.failed}</td>
                    </tr>
                    <tr>
                      <th scope="row">Total Workers</th>
                      <td>${Object.keys(summary.workerMap).length}</td>
                    </tr>
                  </tbody>
                </table>
              </article>
            </div>
            <div class="three columns">
              <article class="table_area">
                <header class="table_header steps">
                  <h6>Test Steps</h6>
                </header>
                <table>
                  <thead></thead>
                  <tbody>
                    <tr>
                      <th scope="row">Total</th>
                      <td>${summary.step.total}</td>
                    </tr>
                    <tr>
                      <th scope="row">Failed</th>
                      <td>${summary.step.failed}</td>
                    </tr>
                    <tr>
                      <th scope="row">Skipped</th>
                      <td>${summary.step.skipped}</td>
                    </tr>
                    <tr>
                      <th scope="row">Pending</th>
                      <td>${summary.step.pending}</td>
                    </tr>
                  </tbody>
                </table>
              </article>
            </div>
            <div class="three columns">
              <article class="table_area">
                <header class="table_header issues">
                  <h6>Total Issues</h6>
                </header>
                <table>
                  <thead></thead>
                  <tbody>
                    <tr>
                      <th scope="row">Application</th>
                      <td>${Object.keys(summary.issue.app).length}</td>
                    </tr>
                    <tr>
                      <th scope="row">Automation</th>
                      <td>${Object.keys(summary.issue.auto).length}</td>
                    </tr>
                    <tr>
                      <th scope="row">Unknown</th>
                      <td>${Object.keys(summary.issue.unknow).length}</td>
                    </tr>
                    <tr>
                      <th scope="row">To be defined</th>
                      <td>${Object.keys(summary.issue[""]).length}</td>
                    </tr>
                  </tbody>
                </table>
              </article>
            </div>
            <div class="three columns">
              <article class="table_area">
                <header class="table_header workers">
                  <h6>Failed Scenario Breakdown</h6>
                </header>
                <table>
                  <thead></thead>
                  <tbody>
                    <tr>
                      <th>Application fails</th>
                      <td>${Object.values(summary.issue.app).length?Object.values(summary.issue.app).map(x=>x.total).reduce((s,v)=>s+v):0}</td>
                    </tr>
                    <tr>
                      <th scope="row">Automation fails</th>
                      <td>${Object.values(summary.issue.auto).length?Object.values(summary.issue.auto).map(x=>x.total).reduce((s,v)=>s+v):0}</td>
                    </tr>
                    <tr>
                      <th scope="row">Unknown fails</th>
                      <td>${Object.values(summary.issue.unknow).length?Object.values(summary.issue.unknow).map(x=>x.total).reduce((s,v)=>s+v):0}</td>
                    </tr>
                    <tr>
                      <th scope="row">TBD fails</th>
                      <td>${Object.values(summary.issue[""]).length?Object.values(summary.issue[""]).map(x=>x.total).reduce((s,v)=>s+v):0}</td>
                    </tr>
                  </tbody>
                </table>
              </article>
            </div>
          </div>
        </section>
        <!-- tabs -->
        <section class="tabs_section">
          <div class="tabset">
            <!-- Tab 1 -->
            <input type="radio" name="tabset" id="tab1" aria-controls="issues" checked>
            <label for="tab1">Issue Overview</label>
            <!-- Tab 2 -->
            <input type="radio" name="tabset" id="tab2" aria-controls="steps">
            <label for="tab2">Slowest Test Steps</label>
            <!-- Tab 3 -->
            <input type="radio" name="tabset" id="tab3" aria-controls="workers">
            <label for="tab3">Workers Job Log</label>
    
            <div class="tab-panels">
              <section id="issues" class="tab-panel">
                <table id="issuetable">
                  <thead>
                    <tr>
                      <th scope="col">Impact</th>
                      <th scope="col">Error Hash</th>
                      <th scope="col">Description</th>
                      <th scope="col">Type</th>
                      <th scope="col">Scope</th>
                      <th scope="col">Url</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${issueHtml}
                  </tbody>
                </table>
              </section>
              <section id="steps" class="tab-panel">
                <table>
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Test Step</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${slowHtml}
                  </tbody>
                </table>
              </section>
              <section id="workers" class="tab-panel">
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Start</th>
                      <th scope="col">End</th>
                      <th scope="col">Worker</th>
                      <th scope="col">Test id</th>
                      <th scope="col">Test name</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${detailHtml}
                  </tbody>
                </table>
              </section>
            </div>
          </div>
        </section>
        <footer>
          <p class="copy"> &copy; 2021 - Boozang INC. ALL RIGHTS RESERVED. </p>
        </footer>
      </div>
    </body>
    </html>`;
    console.log("complete summary!")
    let d=new Date()
    fs.writeFileSync(`bz-report-${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}.html`, html);
    
  }catch(ex){
    console.log(ex.message)
  }
}


module.exports = {
  listJsonFiles,
  mergeFiles,
  writeMergedFile
};
