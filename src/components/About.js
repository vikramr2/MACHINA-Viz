import React, { useState, useEffect } from 'react';
import ReactDOM from "react-dom";
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
  } from "react-router-dom";

import clonal from "../assets/clonal.jpeg";
import migration from "../assets/migration.jpeg";

function About() {
    return (
        <div className='about'>
            <div className='panel about'>
                <div className='aboutcontainer'>
                    <p className='backarrow'><b><Link to="" style={{ textDecoration: 'none', color: 'black'}}>&#8592; home</Link></b></p>
                    <h1 className='abouttitle'>Enter MACHINA-Viz</h1>
                </div>
                <p><b>MACHINA-Viz</b> is a personalized medical tool to visualize cancer metastasis.</p>
                <p><b>The Parsimonious Migration History Problem:</b> Given current oncological mutations at their respective anatomical sites, how can we infer their mutation tree as well as a network of anatomical sites inferring metastases?</p>
                <p><b>Visualization Format:</b> All structures have directed edges.</p>
                <ul style={{columns: 1}}>
                    <li><p><b>Clonal Tree (Left):</b> This is a tree of oncological mutations. Each node in this tree is a variant allele in the cancer patient. Each edge is a mutation from one variant to another.</p></li>
                    <li><p><b>Migration Graph (Right):</b> Each node in the clonal tree has a tag with an anatomical location inferred using <a href='https://en.wikipedia.org/wiki/Maximum_parsimony_(phylogenetics)'>Maximum Parsimony</a>. The clonal tree is compressed into a migration graph where each node represents an anatomical location, and each edge is a metastasis (e.g. a migration) between two anatomical locations.</p></li>
                    <li><p><b>Summary:</b> You can also view a summary migration graph that is computed by unioning edges across migration graphs in each solution. Edges are weighted by the number of solutions they appear in.</p></li>
                </ul>
                <div class="image-container">
                    <img className="aboutimg" src={clonal} alt="Image 1"/>
                    <img className="aboutimg" src={migration} alt="Image 2"/>
                </div>
                <p><b>Generating inputs: </b>We have provided a <a href="https://github.com/vikramr2/json_compression">json compression</a> program that takes an output directory from MACHINA that contains <b>.tree</b> files and their corresponding <b>.labeling</b> files, and returns a <b>.json</b> file that can be used as input for this visualizer. For more information, see this <a href='https://github.com/vikramr2/json_compression/blob/main/README.md'>README</a>.</p>
                <p><b>Questions? Contact</b></p>
                <ul id="singlecol">
                    <li><p>Akul Joshi (<a href="mailto:akulj2@illinois.edu">akulj2@illinois.edu</a>)</p></li>
                    <li><p>Vikram Ramavarapu (<a href="mailto:vikramr2@illinois.edu">vikramr2@illinois.edu</a>)</p></li>
                    <li><p>Mohammed El-Kebir (<a href="mailto:melkebir@illinois.edu">melkebir@illinois.edu</a>)</p></li>
                </ul>
            </div>
        </div>
    );
}

export default About;