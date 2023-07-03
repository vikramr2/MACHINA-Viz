import React, { useState, useEffect, useContext } from "react"
import ClonalTree from "./ClonalTree.js";
import Migration from "./Migration.js";
import { useHistory } from 'react-router-dom';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

import DefaultDict from "../utils/DefaultDict.js";
import SummaryPanel from "./SummaryPanel.js";

/** Insert a URL parameter
 * 
 * @param {*} key (string) variable name
 * @param {*} value (string) variable value
 */
function insertParam(key, value) {
  // Change a url parameter using URLSearchParams
  let urlParams = new URLSearchParams(window.location.hash.split("?")[1]);
  urlParams.set(key, value);

  // Replace the URL
  //currentUrl.search = urlParams.toString();
  window.location.href = '#/viz?' + urlParams.toString();
}

/** TODO: Replace this with an actual window rather than just an alert message
 * 
 * @param {*} event Event metadata
 */
function handleKeyPress(event) {
  if (event.key === '/') {
    alert('Instructions:\n\nToggle and move around the migration graph and clonal tree. Hover over nodes in the clonal tree to find the corresponding anatomical location for the node.\n\nSelect different solutions from the dropdown on the top left of the panel.\n\nTo compare with another solution, click the [+] on the right. To view the solution space summary, click the [+] on the left.\n\nYou can return home by clicking the [X].');
  }
}

function Viz(props) {
    const [mu, setMu] = useState(0);
    const [gamma, setGamma] = useState(0);
    const [mu2, setMu2] = useState(0);
    const [gamma2, setGamma2] = useState(0);
    const [muSum, setMuSum] = useState(0);
    const [gammaSum, setGammaSum] = useState(0);
    const jsonContents=sessionStorage.getItem("json_data");
    const wholeData = JSON.parse(jsonContents);

    // for filtering when selecting/unselecting edges on summary graph
    const [deletedEdges, setDeletedEdges] = useState([]);
    const [requiredEdges, setRequiredEdges] = useState([]);

    useEffect(() => {
      updateUsedEdgesData();
    }, [deletedEdges, requiredEdges]);

    function onDeleteSummaryEdge(edge_id) {
      setDeletedEdges([...deletedEdges, edge_id]);
    }

    function onRequireSummaryEdge(edge_id) {
      setRequiredEdges([...requiredEdges, edge_id]);
    }

    const [usedData, setUsedData] = useState(wholeData);

    // using setStates for usedData because otherwise usedData will have to be calculated in EVERY re-render
    function updateUsedEdgesData() {
      console.log(deletedEdges);
      console.log(requiredEdges);

      let tempUsedData = {
        "name": wholeData["name"],
        "solutions": []
      };

      if (requiredEdges.length === 0 && deletedEdges.length === 0) {
        console.log("setting used data to whole data");
        setUsedData(wholeData);
        return;
      }
      
      // filter out solutions that include deleted edges
      for (let i = 0; i < wholeData["solutions"].length; i++) {
        let deleted_edge_found = false;
        let required_edge_found = false;

        if (requiredEdges.length === 0) {
          required_edge_found = true;
        }
        
        loop: for (let j = 0; j < wholeData["solutions"][i]["migration"].length; j++) {
          for (let k = 0; k < deletedEdges.length; k++) {
            let edge_id_list = deletedEdges[k].split("->");
            if ((edge_id_list[0] === wholeData["solutions"][i]["migration"][j][0])
                && (edge_id_list[1] === wholeData["solutions"][i]["migration"][j][1])) {
              deleted_edge_found = true;
              break loop;
            }
          }

          for (let k = 0; k < requiredEdges.length; k++) {
            let edge_id_list = requiredEdges[k].split("->");
            if ((edge_id_list[0] === wholeData["solutions"][i]["migration"][j][0])
            && (edge_id_list[1] === wholeData["solutions"][i]["migration"][j][1])) {
              // once we found the required
              required_edge_found = true;
            }
          }
        }

        if (!deleted_edge_found && required_edge_found) {
          // console.log(wholeData["solutions"][i]);
          tempUsedData["solutions"].push(wholeData["solutions"][i]);
        }
      }
      
      // create a summary graph with edge weights
      let summary = {
        "migration": []
      };

      for (let i = 0; i < tempUsedData["solutions"].length; i++) {
        for (let j = 0; j < tempUsedData["solutions"][i]["migration"].length; j++) {
          let edge_found = false;
          for (let k = 0; k < summary["migration"].length; k++) {
            if ((summary["migration"][k][0] === tempUsedData["solutions"][i]["migration"][j][0])
                && (summary["migration"][k][1] === tempUsedData["solutions"][i]["migration"][j][1])) {
              summary["migration"][k][2] += tempUsedData["solutions"][i]["migration"][j][2];
              edge_found = true;
              break;
            }
          }

          if (!edge_found) {
            summary["migration"].push(tempUsedData["solutions"][i]["migration"][j]);
          }
        }
      }

      tempUsedData["summary"] = summary;
      // console.log(wholeData);
      // console.log(tempUsedData);
      setUsedData(tempUsedData);

      // TODO: Make error messages when there are no solutions left
    }

    let labelNames = usedData["solutions"].map((value, index) => {return value["name"]});

    const queryParameters = new URLSearchParams(window.location.hash.split("?")[1]);

    let labelName = queryParameters.get("labeling");
    let labelName2 = queryParameters.get("labeling2");

    const [labeling, setLabeling] = useState(labelName)
    const [labeling2, setLabeling2] = useState(labelName2)

    const [rotate, setRotate] = useState(queryParameters.get("rotated") === "true");
    const [rotate2, setRotate2] = useState(queryParameters.get("rotated2") === "true");

    const [type, setType] = useState(queryParameters.get("type"))

    if (labelName === "undefined") {
      insertParam("labeling", usedData["solutions"][0]["name"]);
      setLabeling(usedData["solutions"][0]["name"])
    }
    if (labelName2 === "undefined") {
      insertParam("labeling2", usedData["solutions"][0]["name"]);
      setLabeling2(usedData["solutions"][0]["name"])
    }

    sessionStorage.setItem("selected", JSON.stringify(new DefaultDict(0)));
    sessionStorage.setItem("violations", JSON.stringify(new DefaultDict(0)));
    
    let coloring = usedData["coloring"];

    const [data, setData] = useState(usedData["solutions"].filter((item) => {return item["name"] === labeling})[0]);
    const [data2, setData2] = useState(usedData["solutions"].filter((item) => {return item["name"] === labeling2})[0]);
    const [tree, setTree] = useState(data["tree"])
    const [tree_labeling, setTreeLabeling] = useState(data["labeling"])
    const [migration, setMigration] = useState(data["migration"])
    const [tree2, setTree2] = useState([])
    const [tree_labeling2, setTreeLabeling2] = useState([])
    const [migration2, setMigration2] = useState([])

    if (coloring === undefined || coloring.length === 0) {
      coloring = data["labeling"]
        .map((item) => item[1])
        .filter((value, index, self) => {
          return self.indexOf(value) === index;
        })
        .map((item, index, self) => [item, `${self.indexOf(item)}`]);
    }

    // TODO: Change all pages to use dict?
    let coloringDict = {};
    for (var i = 0; i < coloring.length; i++) {
      coloringDict[coloring[i][0]] = coloring[i][1];
    }

    useEffect(() => {
      setTree(data["tree"])
      setTreeLabeling(data["labeling"])
      setMigration(data["migration"])
      setMu(sessionStorage.getItem("mu"));
      setGamma(sessionStorage.getItem("gamma"));
    }, [labeling])

    let coord_map = usedData["map"]; 

    let handleLabelChange = (event) => {
      insertParam("labeling", event.target.value);
      setLabeling(event.target.value)
      setData(usedData["solutions"].filter((item) => {return item["name"] === event.target.value})[0]);
    }

    let handleLabelChange2 = (event) => {
      insertParam("labeling2", event.target.value);
      setLabeling2(event.target.value)
      setData2(usedData["solutions"].filter((item) => {return item["name"] === event.target.value})[0]);
    }

    let addTab = (event) => {
      //window.location = `${window.location.protocol}//${window.location.host}/mach2-viz/#/dualviz?labeling=${queryParameters.get("labeling")}&labeling2=${queryParameters.get("labeling")}`;
      if (type === 'sumviz') {
        insertParam("type", "triviz")
        setType('triviz')
      } else {
        insertParam("type", "dualviz")
        setType('dualviz')
      }
      insertParam("labeling2", labeling)
      setLabeling2(labeling)
      setData2(usedData["solutions"].filter((item) => {return item["name"] === labeling})[0]);
      setMu2(sessionStorage.getItem("mu2"));
      setGamma2(sessionStorage.getItem("gamma2"));
    }

    let closeTab = (tabIndex) => {
      if (type === 'dualviz' || type === 'triviz') {
        setType(type === 'dualviz' ? 'viz' : 'sumviz')
        console.log(tabIndex)
        if (tabIndex === 1) {
          setData(data2)
          setLabeling(labeling2)
          setRotate(rotate2)
          setTree(data2["tree"])
          setTreeLabeling(data2["labeling"])
          setMigration(data2["migration"])
        }
        insertParam('type', 'viz')
      } else {
        window.location = `${window.location.protocol}//${window.location.host}/mach2-viz/#/`
      }
    }

    useEffect(() => {
      if (data2) {
        setTree2(data2["tree"])
        setTreeLabeling2(data2["labeling"])
        setMigration2(data2["migration"])
      }
    }, [data2])

    useEffect(() => {
      setMu2(sessionStorage.getItem("mu2"));
      setGamma2(sessionStorage.getItem("gamma2"));
    }, [tree2])

    let gotoSummary = (event) => {
      if (type === 'dualviz') {
        setType('triviz');
        insertParam('type', 'triviz')
      } else {
        setType('sumviz');
        insertParam('type', 'sumviz')
      }
    }

    let rotateFn = (event) => {
      let rotated = queryParameters.get("rotated") === "true";
      insertParam("rotated", !rotated);
      setRotate(!rotated)
    }

    let rotateFn2 = (event) => {
      let rotated2 = queryParameters.get("rotated2") === "true";
      insertParam("rotated2", !rotated2);
      setRotate2(!rotated2)
    }

    useEffect(() => {
      document.addEventListener("keydown", handleKeyPress);
      setMu(sessionStorage.getItem("mu"));
      setGamma(sessionStorage.getItem("gamma"));
      setMu2(sessionStorage.getItem("mu2"));
      setGamma2(sessionStorage.getItem("gamma2"));
      setMuSum(sessionStorage.getItem("musum"));
      setGammaSum(sessionStorage.getItem("gammasum"));
    });

    const [evtBus, setEvtBus] = useState({
      listeners: [],
      addListener(callback) {
        this.listeners.push(callback);
      },
      removeListener(callback) {
        this.listeners = this.listeners.filter(listener => listener !== callback);
      },
      fireEvent(eventName, eventData) {
        this.listeners.forEach((listener) => {
          listener(eventName, eventData);
        });
      },
    });



    // keeping track of edges that are not used
    // update unusedEdges whenever

    return (
      <div className="viz">
        {type !== 'sumviz' && type !== 'triviz' ? 
          <div className="panel tab_add2" onClick={gotoSummary}><p className='addpanelp'><b>+</b></p></div>
          : <></>}
        {(type === 'sumviz' || type === 'triviz') ?
          <SummaryPanel 
            type={type}
            setType={setType}
            insertParam={insertParam}
            usedData={usedData}
            coloring={coloring}
            muSum={muSum}
            gammaSum={gammaSum}
            evtBus={evtBus}
            setEvtBus={setEvtBus}
            onDeleteSummaryEdge={onDeleteSummaryEdge}
            onRequireSummaryEdge={onRequireSummaryEdge}
          /> : <></>}
        <div className={`panel info ${
            type === 'dualviz' ? 'one' : 
            type === 'sumviz' ? 'one two' :
            type === 'triviz' ? 'tri two' :
            ''
          }`}>
          <div className="titlewrapper">
            <label className="titleelem left" for="labelings"><p><b>Full Labeling:
              <select name="labelings" id="labelings" onChange={handleLabelChange}>
                {labelNames.map(l => 
                  {return (l === labeling) ? <option value={l} selected>{l}</option> : <option value={l}>{l}</option>}
                )}
              </select>
            </b></p></label>
            <h3 className="viztitle"><b>{data["name"]}</b></h3>
            {(type !== 'dualviz' && type !== 'triviz' && type !== 'sumviz') ?
              <p className="titleelem end"><b>Press [/] for help &nbsp;&nbsp;</b></p> :
              <></>}
            {type !== 'sumviz' ? 
              <Link onClick={closeTab.bind(null, 1)} style={{ textDecoration: 'none', color: 'black'}}><p className='abouttext viz'><b>[X]</b></p></Link>
              : <></>}
          </div>
          <div className={coord_map === undefined ? "leftcolumn nolegend" : "leftcolumn"}>
            <div className={`panel migration top ${(type === 'dualviz' || type === 'triviz') ? 'left' : ''}`}>
              <p className="paneltitle"><b>Migration Graph</b></p>
              <p className="paneltitle mu">{`\u03BC: ${mu}`}</p>
              <p className="paneltitle gamma">{`\u03B3: ${gamma}`}</p>
              <button type="button" className="paneltitle button" onClick={rotateFn}>Rotate</button>
              <Migration tree={tree} labeling={tree_labeling} coloring={coloring} migration={migration} evtbus={evtBus} rotated={rotate}/>
            </div>
            <div className={`panel migration ${(type === 'dualviz' || type === 'triviz') ? 'left': ''}`}>
              <p className="paneltitle"><b>Clonal Tree</b></p>
              <ClonalTree tree={tree} labeling={tree_labeling} coloring={coloring} evtbus={evtBus}/>
            </div>
          </div>
        </div>
        {(type === 'dualviz' || type === 'triviz') ? 
          <div className={`panel info ${type === 'dualviz' ? 'one two' : 'tri three'}`}>
            <div className="titlewrapper">
                <label className="titleelem left" for="labelings"><p><b>Full Labeling:
                <select name="labelings" id="labelings" onChange={handleLabelChange2}>
                    {labelNames.map(l => 
                    {return (l === labeling2) ? <option value={l} selected>{l}</option> : <option value={l}>{l}</option>}
                    )}
                </select>
                </b></p></label>
                <h3 className="viztitle"><b>{data2["name"]}</b></h3>
                <a onClick={closeTab.bind(null, 2)} style={{ textDecoration: 'none', color: 'black'}}><p className='abouttext viz'><b>[X]</b></p></a>
            </div>
            <div className={coord_map === undefined ? "leftcolumn nolegend" : "leftcolumn"}>
              <div className={`panel migration top ${(type === 'dualviz' || type === 'triviz') ? 'left' : ''}`}>
                <p className="paneltitle"><b>Migration Graph</b></p>
                <p className="paneltitle mu">{`\u03BC: ${mu2}`}</p>
                <p className="paneltitle gamma">{`\u03B3: ${gamma2}`}</p>
                <button type="button" className="paneltitle button" onClick={rotateFn2}>Rotate</button>
                <Migration tree={tree2} labeling={tree_labeling2} coloring={coloring} migration={migration2} evtbus={evtBus} rightcol={true} rotated={rotate2}/>
              </div>
              <div className={`panel migration ${(type === 'dualviz' || type === 'triviz') ? 'left': ''}`}>
                <p className="paneltitle"><b>Clonal Tree</b></p>
                <ClonalTree tree={tree2} labeling={tree_labeling2} coloring={coloring} evtbus={evtBus} rightcol={true}/>
              </div>
            </div>
          </div> : 
          <></>}
        {type !== 'dualviz' && type !== 'triviz' ?
          <div className="panel tab_add" onClick={addTab}><p className='addpanelp'><b>+</b></p></div>
          : <></>
        }
      </div>
    )
}

export default Viz;