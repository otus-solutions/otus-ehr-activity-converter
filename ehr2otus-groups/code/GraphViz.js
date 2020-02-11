const FileHandler = require('./FileHandler');
const exec = require('child_process').exec;
const execSync = require('child_process').execSync;
const dotCommand = "dot"; //'"C:\\Program Files (x86)\\GraphViz\\bin\\dot.exe"'; //. on Windows

const DEFAULT_NODE_LABEL = "";

class GraphViz {

	constructor(){
		this.nodes = [];
		this.edges = [];
	}
  
	save(pathNoExtension){
		let content = "digraph G {\n";
		for(let node of this.nodes){
			content += node.toGraphViz();
		}
		content += this.edges.join("\n") + "\n}";
		FileHandler.writeNoMessage(pathNoExtension + ".dot", content);
		//dotToPng(pathNoExtension + ".dot", pathNoExtension + ".png");
	}
	 
	addNode(id, fillColor="white", isDashed=false){
		try {
			const index = this._indexOfNode(id, this.nodes);
			this.nodes[index].update(fillColor);
			this.nodes[index].setAsDashed(isDashed);
		} 
		catch (error) {
			const node = new Node(id, fillColor);
			node.setAsDashed(isDashed);
			this.nodes.push(node);
		}
	}

	addNodeWithLabel(id, fillColor, label){
		try {
			let index = this._indexOfNode(id, this.nodes);
			this.nodes[index].update(fillColor, label);
		} 
		catch (error) {
			this.nodes.push(new Node(id, fillColor, label));
		}
	}	

	addEdge(originNodeId, targetNodeId, label=DEFAULT_NODE_LABEL){
		const color = (label===DEFAULT_NODE_LABEL ? "blue" : "black");
		this.edges.push(`${originNodeId} -> ${targetNodeId} [label=\"${label}\" color=${color}];`);
	}
}

module.exports = GraphViz;

/*
 * Private things
 */

class Node {

	constructor(id, fillColor, label){
		this.id = id;
		this.fillColor = fillColor;
		this.label = label;
		this.isDashed = false;
	}

	update(fillColor, label){
		this.fillColor = fillColor;
		this.label = label;
	}

	setAsDashed(isDashed){
		this.isDashed = isDashed;
	}

	toGraphViz(){
		const style = (this.isDashed? '"dashed,filled"' : '"filled"');
		if(!this.label){
			return `${this.id} [fillcolor=${this.fillColor},style=${style}]\n`;
		}
		return `${this.id} [label=\"${this.label}\",fillcolor=${this.fillColor},style=${style}]\n`;
	}
}

function _indexOfNode(id, nodes){
	let i = 0, found = false;
	while(!found && i < nodes.length){
		found = (nodes[i++].id === id);
	}
	return (found? i-1 : -1);
}


function dotToPng(dotFilePath, pngFilePath){
	const command = `${dotCommand} -Tpng ${dotFilePath} > ${pngFilePath}`;
	// exec(command,
	// 	function (error) {
	// 		if (error) {
	// 			console.error('\nexec error in command: ' + command);
	// 			console.error(error);
	// 			throw error;
	// 		}
	// 	}
	// );
	execSync(command);
	console.log('Saved ' + pngFilePath);//.
}
