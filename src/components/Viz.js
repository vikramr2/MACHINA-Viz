import React, { useState, useEffect } from "react"
import { decompressUrlSafe } from '../utils/lzma-url.js'
import ClonalTree from "./ClonalTree.js";
import Migration from "./Migration.js";
import Legend from "./Legend.js";

function insertParam(key, value) {
  // Get the current url
  let currentUrl = new URL(window.location.href);

  // Change a url parameter using URLSearchParams
  let urlParams = new URLSearchParams(currentUrl.search);
  urlParams.set(key, value);

  // Replace the URL
  currentUrl.search = urlParams.toString();
  window.location.href = urlParams.toString();

  // Reload the page
  window.location.reload();
}

function Viz() {
    const queryParameters = new URLSearchParams(window.location.search);
    const fileContents = decompressUrlSafe(queryParameters.get("data"));
    const data = JSON.parse(fileContents);
    
    const coloring = data["coloring"]
    const tree = data["clone_tree"]["tree"]
    const tree_labeling = data["clone_tree"]["labeling"].map((value, index) => {
      if (value["name"] === queryParameters.get("labeling")) {
        return value["data"];
      }
    }).filter((item) => {return item != undefined})[0];

    let labelnames = data["clone_tree"]["labeling"].map((value, index) => {return value["name"]});

    let handleLabelChange = (event) => {
      insertParam("labeling", event.target.value);
    }

    return (
      <div className="viz">
        <div className="leftpanel">
          <div className="panel instr">
            <p><b>Instructions:</b> Drag over the model in the right to 
            rotate the figure around. Anatomic sites will be 
            highlighted according to the color scheme in the 
            legend to the right. To view anatomic sites in 
            different systems, click the tabs in the right.</p>

            <p>Click the tabs below to switch between viewing the 
            clonal tree and migration graph. Multiple labelings
            and trees may be inferred if a reported labeling is
            not given. In which case there will be a drop-down to
            select a potential solution.</p>
          </div>
        </div>
        <div className="panel info">
          <h3><b>{data["name"]}</b></h3>
          <div className="columnwrapper">
            <div className="leftcolumn">
              <div className="panel migration">
                <p className="paneltitle"><b>Migration Graph</b></p>
                <Migration tree={tree} labeling={tree_labeling} coloring={coloring}/>
              </div>
              <div className="panel migration">
              <p className="paneltitle"><b>Clonal Tree</b></p>
                <ClonalTree tree={tree} labeling={tree_labeling} coloring={coloring}/>
              </div>
            </div>
            <div className="rightcolumn">
              <div className="panel migration legend">
                <Legend coloring={coloring}/>
              </div>
              <div className="panel migration legend map"></div>
            </div>
          </div>
        </div>
      </div>
    )
}

export default Viz;