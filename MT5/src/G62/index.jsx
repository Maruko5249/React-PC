import React, { Component } from 'react'
import G6 from "@antv/g6";
import 'scss/G62.scss'

class G6Html2 extends Component {

    constructor(props) {
        super(props);
        this.state = {
            graph: '',
            initData: {
                // 点集
                nodes: [{
                    id: 'node1', // 节点的唯一标识
                    type: 'circle',
                    x: 100,      // 节点横坐标
                    y: 200,      // 节点纵坐标
                    label: '起始点', // 节点文本
                }, {
                    id: 'node2',
                    type: 'circle',
                    x: 300,
                    y: 200,
                    label: '目标点',
                },
                {
                    id: 'node3',
                    type: 'circle',
                    x: 500,
                    y: 200,
                    label: '自定义文本内容',
                    size: 40
                }
                ],
                // 边集
                edges: [
                    // 表示一条从 node1 节点连接到 node2 节点的边
                    {
                        source: 'node1',  // 起始点 id
                        target: 'node2',  // 目标点 id
                        label: '我是连线'   // 边的文本
                    },
                    {
                        source: 'node2',  // 起始点 id
                        target: 'node3',  // 目标点 id
                        label: '自定义线上内容'   // 边的文本
                    },

                ]
            }

        };
    }

    componentDidMount() {

        const graph = new G6.Graph({
            container: 'mountNode', // 指定挂载容器
            width: 2000,             // 图的宽度
            height: 500,          // 图的高度
            selectorTypeText: "circle",
            modes: {
                default: ['drag-node', 'click-select'],
                addNode: ['click-add-node', 'click-select'],
                addEdge: ['click-add-edge', 'click-select'],
                delNode: ['del-node', 'click-select'],
                defaultCircular: 'circlr',
                // ellipse: ['ellipse', 'click-add-node', 'click-select'],
                // rect: 'rect',
                // diamond: ['click-add-node', 'click-select']
            },
            // The node styles in different states
            nodeStateStyles: {
                // The node styles in selected state, corresponds to the built-in click-select behavior
                selected: {
                    stroke: '#666',
                    lineWidth: 2,
                    fill: 'steelblue'
                }
            }
        });

        let addedCount = 0;
        G6.registerBehavior('click-add-edge', {
            getEvents() {
                return {
                    'node:click': 'onClick',
                    mousemove: 'onMousemove',
                    'edge:click': 'onEdgeClick', // 点击空白处，取消边
                };
            },
            onClick(ev) {
                const node = ev.item;
                const graph = this.graph;
                const point = {
                    x: ev.x,
                    y: ev.y
                };
                const model = node.getModel();
                if (this.addingEdge && this.edge) {
                    graph.updateItem(this.edge, {
                        target: model.id
                    });
                    // graph.setItemState(this.edge, 'selected', true);
                    this.edge = null;
                    this.addingEdge = false;
                } else {
                    this.edge = graph.addItem('edge', {
                        source: model.id,
                        target: point
                    });
                    this.addingEdge = true;
                }
                console.log(ev)
            },
            onMousemove(ev) {
                const point = {
                    x: ev.x,
                    y: ev.y
                };
                if (this.addingEdge && this.edge) {
                    this.graph.updateItem(this.edge, {
                        target: point
                    });
                }
            },
            onEdgeClick(ev) {
                const currentEdge = ev.item;
                // 拖拽过程中，点击会点击到新增的边上
                // eslint-disable-next-line
                if (this.addingEdge && this.edge == currentEdge) {
                    graph.removeItem(this.edge);
                    this.edge = null;
                    this.addingEdge = false;
                }
            },
        });

        // Register a custom behavior to add node
        G6.registerBehavior('click-add-node', {
            getEvents() {
                return {
                    'canvas:click': 'onClick'
                };
            },
            /**
             * 
             * @param {在画布上点击新增节点} ev 
             */
            onClick(ev) {
                // eslint-disable-next-line
                const graph = this.graph;
                // eslint-disable-next-line
                const node = graph.addItem('node', {
                    x: ev.canvasX,
                    y: ev.canvasY,
                    id: `node-${addedCount}`, // 生成唯一的 id
                    type: graph.cfg.modes.defaultCircular
                });
                addedCount++;
            }
        });
        G6.registerBehavior('del-node', {
            getEvents() {
                return {
                    'node:dblclick': 'onDblClick'
                };
            },
            onDblClick(ev) {
                const graph = this.graph;
                const node = ev.item
                graph.remove(node)
            }
        });
        let list = []
        //本地缓存没有值就读取数据 有值就读取本地缓存
        // eslint-disable-next-line
        if (localStorage.getItem("list") == undefined) {
            list = this.state.initData
            localStorage.setItem("list", JSON.stringify(this.state.initData))

        } else {
            list = JSON.parse(localStorage.getItem("list"))
        }

        graph.data(list);  // 加载数据
        graph.render();        // 渲染

        /**
         * 赋值给state对象
         */
        this.setState({
            graph: graph
        })

        document.getElementById('selector').addEventListener('change', e => {
            const value = e.target.value;
            graph.setMode(value);
        });
    }

    /**
     * 更新画布
     */
    getCanvas() {
        let graph = this.state.graph;
        graph.clear();
        graph.data(this.state.initData);
        graph.render();

        this.setState({
            graph: graph
        })
    }

    /**
     * 提交按钮
     * 改变节点大小 节点文字 线上文字
     */
    changeHandle() {
        let allValue = this.state.initData;

        //组建新的节点
        //距离需要++

        let number = allValue.edges[allValue.edges.length - 1].source.substring(4)
        number = parseInt(number)
        let addEdges = {
            id: 'edge' + (number + 1),
            label: document.getElementById('lText').value,
            target: 'node' + (number + 2),  // 起始点 id
            source: 'node' + (number + 1),  // 目标点 id
        }
        // console.log(document.getElementById('lText').value)

        let x = allValue.nodes[allValue.nodes.length - 1].x
        x = x + 100

        // console.log(document.getElementById('cSize').value)
        // console.log(document.getElementById('cText').value)

        let addNodes = {
            size: document.getElementById('cSize').value,
            label: document.getElementById('cText').value,
            id: 'node' + (number + 2),
            type: this.state.selectorTypeText,
            x: x,
            y: 200,
            // size: 50,
        }

        allValue.nodes.push(addNodes)
        allValue.edges.push(addEdges)
        localStorage.setItem("list", JSON.stringify(allValue))

        this.setState({
            initData: allValue
        });
        this.getCanvas();
    }
    isRotate() {

        this.setState({
            selectorTypeText: document.getElementById("selectorType").value
        })
    }
    render() {
        return <div className="mt-G62-page">
            <form method="get">
                <div className="mt-G62-con">
                    <p>
                        <span>请选择节点状态</span>
                        <select id="selector">
                            <option value="default">默认</option>
                            <option value="addNode">添加节点</option>
                            <option value="addEdge">添加边</option>
                            <option value="delNode">删除节点</option>
                        </select>
                    </p>

                    <p><span>自定义圈大小</span><input type="number" defaultValue="" id="cSize" /></p>
                    <p><span>自定义节点文字</span><input type="text" defaultValue="" id="cText" /></p>
                    <p><span>自定义线上文字</span><input type="text" defaultValue="" id="lText" /></p>

                    <p>
                        <span>请选择节点类型</span>
                        <select id="selectorType" onChange={() => this.isRotate()} >
                            <option value="defaultCircular">默认(圆形)</option>
                            <option value="ellipse">椭圆</option>
                            <option value="rect">矩形</option>
                            <option value="diamond">菱形</option>
                            <option value="triangle">三角形</option>
                            <option value="star">五角星形</option>
                        </select>
                    </p>
                    <p className="mt-sub-btn"><span><input type="button" value="Submit" className="subBtn" onClick={() => this.changeHandle()} /></span></p>
                </div>
            </form>
            <div id="mountNode"></div>
        </div>;
    }

}

export default G6Html2;