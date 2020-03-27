const FileHandler = require('./FileHandler');

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
		for (let edge of this.edges){
			content += edge.toGraphViz();
		}
		content += "\n}";
		FileHandler.writeNoMessage(pathNoExtension + ".dot", content);
	}

	isEmpty(){
		return (this.nodes.length===0 && this.edges===0);
	}
	 
	addNode(id, fillColor="white", isDashed=false){
		try {
			const index = _indexOfNode(id, this.nodes);
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
			let index = _indexOfNode(id, this.nodes);
			this.nodes[index].update(fillColor, label);
		} 
		catch (error) {
			this.nodes.push(new Node(id, fillColor, label));
		}
	}	

	addEdge(originNodeId, targetNodeId, label=DEFAULT_NODE_LABEL, color="blue", style="solid"){
		const edge = new Edge(originNodeId, targetNodeId, color, label);
		edge.style = style;

		let i = 0, found = false;
		while(!found && i < this.edges.length){
			found = (this.edges[i++].equals(edge));
		}
		if(!found){
			this.edges.push(edge);
		}
	}

	sortNodes(){
		this.nodes.sort(function(node1, node2){
			if ( node1.id < node2.id ){
				return -1;
			}
			if ( node1.id > node2.id ){
				return 1;
			}
			return 0;
		});
	}
}

module.exports = GraphViz;

/*
 * Private things
 */

function _indexOfNode(id, nodes){
	let i = 0, found = false;
	while(!found && i < nodes.length){
		found = (nodes[i++].id === id);
	}
	return (found? i-1 : -1);
}

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

class Edge {

	static get STYLES(){
		return {
			SOLID: "solid",
			DOTTED: "dotted",
			DASHED: "dashed",
			BOLD: "bold"
		};
	}

	constructor(origin, target, color, label=""){
		this.origin = origin;
		this.target = target;
		this.color = color;
		this.label = label;
		this.style = Edge.STYLES.SOLID;
	}

	update(color, label){
		this.color = color;
		this.label = label;
	}

	setStyle(style){
		this.style = style;
	}

	toGraphViz(){
		return `${this.origin} -> ${this.target} [label=\"${this.label}\" color=${this.color} style=${this.style}]\n`;
	}

	equals(otherEdge){
		if(!otherEdge instanceof Edge){
			return false;
		}
		return (this.origin === otherEdge.origin && this.target === otherEdge.target);
	}
}
