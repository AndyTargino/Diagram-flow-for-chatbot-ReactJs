import * as React from 'react';

import {
    useState,
    useCallback,
    useEffect
} from "react";

import ReactFlow, {
    Controls,
    Background,
    applyNodeChanges,
    applyEdgeChanges,
    addEdge,
    Panel,
    getBezierPath,
    MiniMap,
    ReactFlowProvider,
    useReactFlow
} from "reactflow";

import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import BorderColorIcon from '@mui/icons-material/BorderColor';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import ModeCommentIcon from '@mui/icons-material/ModeComment';
import SendIcon from '@mui/icons-material/Send';
import EditFlowModal from './EditFlowModal';
import ChatBotTestModal from './ChatBotTestModal';

import MobileFriendlyIcon from '@mui/icons-material/MobileFriendly';

import FlagIcon from '@mui/icons-material/Flag';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import MoveUpIcon from '@mui/icons-material/MoveUp';
import DoneAllIcon from '@mui/icons-material/DoneAll';

import "reactflow/dist/style.css";

//FIles to save data initial 

import initialNodesFile from '../assets/saveInitial/initialNodes.json'
import initialEdgesFile from '../assets/saveInitial/initialEdges.json'
import LateralMenu from './LateralMenu';

const foreignObjectSize = 40;
let nodeId = 1;

const nodeColor = (node) => {
    switch (node.type) {
        case 'input':
            return '#42bf40';
        case 'output':
            return '#ff0072';
        default:
            return '#6865A5';
    }
};



let queues = [{
    "id": 1,
    "name": "Financeiro"
},
{
    "id": 2,
    "name": "Suporte"
},
{
    "id": 3,
    "name": "Dúvidas"
}];


function getQueue(tipo, id) {
    if (Number(id) === 0) {
        if (tipo === 'end') {
            return '- Finalizar';
        } else {
            return;
        }
    }

    let fila = queues.filter(q => q.id === id)
    if (fila.length) {
        if (fila[0].name) {
            return `- ${fila[0].name}`;
        }
    }
}


function ChatBotFlow() {

    const reactFlowInstance = useReactFlow();

    // ==== Renderizar objetos anteriores na tela ==== //
    const renderIcon = (type, endOption) => {
        if (type === 'start') {
            return <Tooltip title="Inicio do fluxo"><FlagIcon /></Tooltip>;
        }
        if (type === 'conditional') {
            return <Tooltip title="Uma pergunta ou seleção para prosseguir"><QuestionMarkIcon /></Tooltip>;
        }
        if (type === 'end') {
            if (endOption === 0) {
                return <Tooltip title="Finaliza o fluxo encerrando o atendimento"><DoneAllIcon /></Tooltip>;
            } else {
                return <Tooltip title="Finaliza o fluxo movendo para fila"><MoveUpIcon /></Tooltip>;
            }
        }
    }

    const RenderObject = (obj) => {

        let type = obj.type;
        let typeEndFlow = obj.endFlowOption

        let objeto = {};

        objeto = {
            id: `${obj.id}`,
            data: {
                label: (
                    <Box component="div" className="showOptions">
                        <Tooltip title="Editar" placement="top">
                            <IconButton className="configButton" style={{
                                position: 'absolute',
                                margin: '-26% 0px 0px',
                                left: '0px'
                            }}
                                onClick={() => EditNodeElement(`${obj.id}`)}
                            >
                                <BorderColorIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Deletar" placement="top">
                            <IconButton className="configButton" style={{
                                position: 'absolute',
                                margin: '-25% -5px 0px 0px',
                                right: '0px'
                            }}
                                onClick={() => deleteNodeCard(`${obj.id}`)}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Tooltip>
                        <Box component='p'
                            className="headerObject"
                            style={{
                                margin: '5px',
                                wordBreak: 'break-word',
                                fontSize: '15px'
                            }}>{obj.title}</Box>

                        <Box component='div' style={{
                            display: 'flex', alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                        </Box>
                        <Box component='div' style={{
                            background: 'white',
                            color: 'black',
                            marginTop: '-1px',
                            padding: '10px',
                            display: 'flex', alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Box component='p'
                                className="bodyObject"
                                style={{
                                    margin: '5px',
                                    wordBreak: 'break-word'
                                }}>{obj.message}</Box>
                            <Box component='p'
                                className="endOption"
                                style={{ display: 'none' }}>{typeEndFlow}</Box>
                        </Box>
                        <Box component='div'
                            style={{
                                margin: '5px 3px 0px 0px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                            <Box component='div'> {renderIcon(type, typeEndFlow)}</Box>
                            <Box component='div'>{type !== 'start' && getQueue(type, typeEndFlow)}</Box>
                        </Box>
                    </Box>
                )
            },
            position: obj.position,
            type: type === 'end' ? 'output' : type === 'start' ? 'input' : type,
            style: obj.style
        }

        return objeto;

    }

    function renderNodes(_nodes) {
        let array = [];
        _nodes.forEach(obj => array.push(RenderObject(obj)));
        return array;
    }

    // ================================================ //


    // =============== Valores iniciais =============== //
    let nodesInLocalStorage = JSON.parse(localStorage.getItem('nodes'));
    let edgesInLocalStorage = JSON.parse(localStorage.getItem('edges'));

    const initialNodes = nodesInLocalStorage ? nodesInLocalStorage : initialNodesFile
    const initialEdges = edgesInLocalStorage ? edgesInLocalStorage : initialEdgesFile

    // ================================================ //


    // ================= REACT props ================== //


    const [modalChatbotOpen, setModalChatbotOpen] = useState(false);
    const [nodes, setNodes] = useState(renderNodes(initialNodes));
    const [edges, setEdges] = useState(initialEdges);
    const [anchorEl, setAnchorEl] = useState(null);
    const handleClickOpenMenu = e => setAnchorEl(e.currentTarget);
    const handleClickCloseMenu = () => setAnchorEl(null);

    const [elementOnEdit, setElementOnEdit] = useState('');
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);

    const [chatBotFlow, setChatBotFlow] = useState({});

    const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
    const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
    const onConnect = useCallback((params) => setEdges((eds) => addEdge(renderNewConnectStyle(params), eds)), []);

    const openMenu = Boolean(anchorEl);


    const { setViewport } = useReactFlow();

    const handleTransform = (x, y) => {


        console.info(x, y)
        let xObjeto = ((-x) + 500)
        let yObjeto = ((-y) + 300)

        setViewport({ x: xObjeto, y: yObjeto, zoom: 1.3 }, { duration: 400 })
    };

    // ================================================ //

    const [positionY, setPositionY] = useState(0);
    const [positionX, setPositionX] = useState(0);

    // ============ BOTÃO DE EXCLUIR ALVO ============= //

    function EdgeButton({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, markerEnd }) {
        const [edgePath, labelX, labelY] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });

        return (
            <>
                <path id={id} style={style} className="react-flow__edge-path" d={edgePath} markerEnd={markerEnd} />
                <foreignObject width={foreignObjectSize} height={foreignObjectSize} x={labelX - foreignObjectSize / 2} y={labelY - foreignObjectSize / 2} className="edgebutton-foreignobject" requiredExtensions="http://www.w3.org/1999/xhtml">
                    <Box component='div'>
                        <button className="edgebutton" onClick={(event) => DeleteTargetEdgeLile(event, id)}> × </button>
                    </Box>
                </foreignObject>
            </>
        );
    }

    // =============== Modal de edições ============== //

    const EditNodeElement = (id) => {

        var button = document.getElementById('ClickZoon');

        let oldProps = getNodeProps(id);

        setElementOnEdit(id)
        setConfirmModalOpen(true)
        console.log(oldProps.positionObject);
        let x = (oldProps.positionObject.x);
        let y = (oldProps.positionObject.y);
        setPositionX(x)
        setPositionY(y)

        setTimeout(() => button.click(), 300);
    }

    // ================ FILTRO DE DADOS =============== //

    const FilterNodeData = (id) => {
        let title = '';
        let message = '';
        let endFlowOption = '';

        const position_object = nodes.map(i => i.id).indexOf(id);
        if (position_object === -1) return;
        nodes[position_object].data.label.props.children.forEach((obj) => {

            if (obj?.props?.children) {
                if ((obj.props.children).length === 2) {
                    let objetoArray = obj.props.children;
                    objetoArray.forEach(obj => {
                        if (obj.props.className === 'bodyObject') { message = obj.props.children }
                        if (obj.props.className === 'endOption') { endFlowOption = obj.props.children }
                    });
                }
            }

            if (obj.props?.className === 'headerObject') { title = obj.props.children }
        });

        const getPosition = (id_name) => {
            if (id_name.includes('end')) {
                return 'end'
            }
            if (id_name.includes('conditional')) {
                return 'conditional'
            }
            if (id_name.includes('start')) {
                return 'start'
            }
        }

        return { id, title, message, endFlowOption, position: nodes[position_object].position, style: nodes[position_object].style, type: getPosition(id) }
    }

    const FilterEdgeData = (edge) => {
        return {
            "animated": edge.animated,
            "id": edge.id,
            "source": edge.source,
            "sourceHandle": edge.sourceHandle,
            "target": edge.target,
            "targetHandle": edge.targetHandle,
            "type": edge.type,
        }
    }

    // ================================================ //

    // ============== Funções de deletar ============== //

    const DeleteTargetEdgeLile = (evt, id) => {
        evt.stopPropagation();
        deleteEdgeLine(id)
    };

    const deleteNodeCard = (id) => setNodes(nds => nds.filter(node => node.id !== id));

    const deleteEdgeLine = (id) => setEdges(eds => eds.filter(edge => edge.id !== id));

    // ================================================ //


    // ========== Pegar propriedades do NODE ========== //

    const getNodeProps = (id) => {

        let lastTitle = '';
        let lastMessage = '';
        let endFlowOption = '';

        const position = nodes.map(i => i.id).indexOf(id);
        if (position === -1) return;

        nodes[position].data.label.props.children.forEach((obj) => {
            if (obj?.props?.children) {
                if ((obj.props.children).length === 2) {
                    let objetoArray = obj.props.children;
                    objetoArray.forEach(obj => {
                        if (obj.props.className === 'bodyObject') { lastMessage = obj.props.children }
                        if (obj.props.className === 'endOption') { endFlowOption = obj.props.children }
                    });
                }
            }

            if (obj.props?.className === 'headerObject') { lastTitle = obj.props.children };

        });

        const getPosition = (id_name) => {
            if (id_name.includes('end')) {
                return 'end'
            }
            if (id_name.includes('conditional')) {
                return 'conditional'
            }
            if (id_name.includes('start')) {
                return 'start'
            }
        }

        return { lastTitle, lastMessage, endFlowOption, background: nodes[position].style.background, position: getPosition(id), positionObject: nodes[position].position }

    }

    // ================================================ //

    // ================= Editar Node ================== //

    const EditNodeObjectProps = (id, title, message, color, endOption, type) => {

        let oldProps = getNodeProps(id);

        let endOptionProps = endOption || endOption === 0 ? endOption : oldProps.endFlowOption;

        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === id) {
                    node.data = {
                        ...node.data,
                        label: (<Box component='div' className="showOptions" id={id}>
                            <Tooltip title="Editar" placement="top">
                                <IconButton className="configButton" style={{
                                    position: `absolute`,
                                    margin: '-26% 0px 0px',
                                    left: '0px'
                                }}
                                    onClick={() => EditNodeElement(id)}
                                >
                                    <BorderColorIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Deletar" placement="top">
                                <IconButton className="configButton" style={{
                                    position: `absolute`,
                                    margin: '-25% -5px 0px 0px',
                                    right: '0px'
                                }}
                                    onClick={() => deleteNodeCard(id)}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Tooltip>
                            <p
                                className="headerObject"
                                style={{ margin: '5px', wordBreak: 'break-word', fontSize: '15px' }}>{title ? title : 'Titulo'}</p>
                            <Box component='div' style={{
                                display: 'flex', alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                            </Box>
                            <Box component='div' style={{
                                background: 'white',
                                color: 'black',
                                marginTop: '-1px',
                                padding: '10px',
                                display: 'flex', alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <p
                                    className="bodyObject"
                                    style={{
                                        margin: '5px',
                                        wordBreak: 'break-word'
                                    }}>{message ? message : 'Mensagem'}</p>
                                <p
                                    className="endOption"
                                    style={{ display: 'none' }}>{endOptionProps}
                                </p>
                            </Box>
                            <Box component='div'
                                style={{
                                    margin: '5px 3px 0px 0px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                <Box component='div'>  {renderIcon(type, endOptionProps)}</Box>
                                <Box component='div'>  {type !== 'start' && getQueue(type, endOptionProps)}</Box>
                            </Box>
                        </Box>),
                    };
                    node.style = {
                        ...node.style,
                        background: color ? color : oldProps.background
                    };
                    node.type = type === 'end' ? 'output' : type
                }
                return node;
            })
        );
    }

    // ================================================ //

    // = DESCONSTRUINDO OBJETO PARA NOVOS PARAMETROS = //

    const renderNewConnectStyle = (props) => {
        let object = {
            "source": props.source,
            "sourceHandle": props.sourceHandle,
            "target": props.target,
            "animated": true,
            "targetHandle": props.targetHandle,
            "type": 'buttonedge',
        }
        return object;
    }

    // ================================================ //

    // ============= Criar novo elemento ============== //

    const createNewNode = useCallback((element) => {
        let object = {};
        const id = `${++nodeId}`;
        if (element === 'start') {
            object = {
                id: `start_${id}`,
                data: {
                    label: (
                        <Box component='div' className="showOptions">
                            <Tooltip title="Editar" placement="top">
                                <IconButton className="configButton" style={{
                                    position: `absolute`,
                                    margin: '-26% 0px 0px',
                                    left: '0px'
                                }}
                                    onClick={() => EditNodeElement(`start_${id}`)}
                                >
                                    <BorderColorIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Deletar" placement="top">
                                <IconButton className="configButton" style={{
                                    position: `absolute`,
                                    margin: '-25% -5px 0px 0px',
                                    right: '0px'
                                }}
                                    onClick={() => deleteNodeCard(`start_${id}`)}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Tooltip>
                            <p
                                className="headerObject"
                                style={{ margin: '5px', wordBreak: 'break-word', fontSize: '15px' }}>{`Inicio do fluxo ${id}`}</p>

                            <Box component='div' style={{
                                display: 'flex', alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                            </Box>
                            <Box component='div' style={{
                                background: 'white',
                                color: 'black',
                                marginTop: '-1px',
                                padding: '10px',
                                display: 'flex', alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <p
                                    className="bodyObject"
                                    style={{
                                        margin: '5px',
                                        wordBreak: 'break-word'
                                    }}>Inicio do fluxo</p>
                                <p
                                    className="endOption"
                                    style={{ display: 'none' }}>{0}
                                </p>
                            </Box>
                            <Box component='div'
                                style={{
                                    margin: '5px 3px 0px 0px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                <Box component='div'>  {renderIcon('start', 0)}</Box>
                            </Box>
                        </Box>
                    )
                },
                position: { x: 10 * nodeId, y: 10 * nodeId },
                type: "input",
                style: {
                    background: '#42bf40',
                    color: '#ffffff',
                    width: 180,
                    fontStyle: 'oblique',
                    padding: '3px',
                    border: '1px'
                }
            }
        }
        if (element === 'cond') {
            object = {
                id: `conditional_${id}`,
                data: {
                    label:
                        (<Box component='div' className="showOptions" id={`conditional_${id}`}>
                            <Tooltip title="Editar" placement="top">
                                <IconButton className="configButton" style={{
                                    position: `absolute`,
                                    margin: '-26% 0px 0px',
                                    left: '0px'
                                }}
                                    onClick={() => EditNodeElement(`conditional_${id}`)}
                                >
                                    <BorderColorIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Deletar" placement="top">
                                <IconButton className="configButton" style={{
                                    position: `absolute`,
                                    margin: '-25% -5px 0px 0px',
                                    right: '0px'
                                }}
                                    onClick={() => deleteNodeCard(`conditional_${id}`)}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Tooltip>
                            <p
                                className="headerObject"
                                style={{ margin: '5px', wordBreak: 'break-word', fontSize: '15px' }}>{`Titulo ${id}`}</p>
                            <Box component='div' style={{
                                display: 'flex', alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                            </Box>
                            <Box component='div' style={{
                                background: 'white',
                                color: 'black',
                                marginTop: '-1px',
                                padding: '10px',
                                display: 'flex', alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <p
                                    className="bodyObject"
                                    style={{
                                        margin: '5px',
                                        wordBreak: 'break-word'
                                    }}>Mensagem</p>
                                <p
                                    className="endOption"
                                    style={{ display: 'none' }}>{0}
                                </p>
                            </Box>
                            <Box component='div'
                                style={{
                                    margin: '5px 3px 0px 0px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                <Box component='div'>  {renderIcon('conditional', 0)}</Box>
                                <Box component='div'>  {getQueue('conditional', 0)}</Box>
                            </Box>
                        </Box>)
                },
                position: { x: 10 * nodeId, y: 10 * nodeId },
                style: {
                    background: '#191a4d',
                    color: '#ffffff',
                    width: 180,
                    fontStyle: 'oblique',
                    padding: '3px',
                    border: '1px'
                },
            }
        }
        if (element === 'end') {
            object = {
                id: `end_flow_${id}`,
                data: {
                    label:
                        (<Box component='div' className="showOptions" id={`end_flow_${id}`}>
                            <Tooltip title="Editar" placement="top">
                                <IconButton className="configButton" style={{
                                    position: `absolute`,
                                    margin: '-26% 0px 0px',
                                    left: '0px'
                                }}
                                    onClick={() => EditNodeElement(`end_flow_${id}`)}
                                >
                                    <BorderColorIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Deletar" placement="top">
                                <IconButton className="configButton" style={{
                                    position: `absolute`,
                                    margin: '-25% -5px 0px 0px',
                                    right: '0px'
                                }}
                                    onClick={() => deleteNodeCard(`end_flow_${id}`)}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Tooltip>
                            <p
                                className="headerObject"
                                style={{ margin: '5px', wordBreak: 'break-word', fontSize: '15px' }}>{`Titulo ${id}`}</p>

                            <Box component='div' style={{
                                display: 'flex', alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                            </Box>
                            <Box component='div' style={{
                                background: 'white',
                                color: 'black',
                                marginTop: '-1px',
                                padding: '10px',
                                display: 'flex', alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <p
                                    className="bodyObject"
                                    style={{
                                        margin: '5px',
                                        wordBreak: 'break-word'
                                    }}>{'Mensagem'}</p>
                                <p
                                    className="endOption"
                                    style={{ display: 'none' }}>{0}</p>
                            </Box>
                            <Box component='div'
                                style={{
                                    margin: '5px 3px 0px 0px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                <Box component='div'>  {renderIcon('end', 0)}</Box>
                                <Box component='div'>  {getQueue('end', 0)}</Box>
                            </Box>
                        </Box>)
                },
                position: { x: 10 * nodeId, y: 10 * nodeId },
                type: "output",
                style: {
                    background: "#bf4040",
                    color: '#ffffff',
                    width: 180,
                    fontStyle: 'oblique',
                    padding: '3px',
                    border: '1px'
                }
            }
        }

        reactFlowInstance.addNodes(object);
    }, []);

    // ================================================ //

    // =============== modal de chatbot =============== //

    const openChatbotModal = () => {

        // Nessesário formatar os dados enviados para conseguir executar no fluxo de chatbot
        let edgesObjects = [];
        let nodesObjects = [];

        edges.forEach(edge => edgesObjects.push(FilterEdgeData(edge)));
        nodes.forEach(node => nodesObjects.push(FilterNodeData(node.id)));

        setChatBotFlow({ 'nodes': nodesObjects, 'edges': edgesObjects });
        setModalChatbotOpen(true);

    }

    // ================================================ //

    const viewData = (e) => {

        let edgesObjects = [];
        edges.forEach(edge => edgesObjects.push(FilterEdgeData(edge)));
        let edgesFormated = JSON.stringify(edgesObjects);
        console.info({ edgesFormated });

        let nodesObjects = [];
        nodes.forEach(node => nodesObjects.push(FilterNodeData(node.id)));
        let nodesFormated = JSON.stringify(nodesObjects);
        console.info({ nodesFormated });
    }

    const saveData = (e) => {

        let edgesObjects = [];
        edges.forEach(edge => edgesObjects.push(FilterEdgeData(edge)));
        let edgesFormated = JSON.stringify(edgesObjects);
        localStorage.removeItem('edges');
        localStorage.setItem('edges', (edgesFormated));

        let nodesObjects = [];
        nodes.forEach(node => nodesObjects.push(FilterNodeData(node.id)));
        let nodesFormated = JSON.stringify(nodesObjects);
        localStorage.removeItem('nodes');
        localStorage.setItem('nodes', (nodesFormated));

    }


    return (
        <Box component='div' id='Teste' style={{
            display: 'flex',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <Box component='div' style={{ height: "100%", width: "100%" }}>
                <>
                    <ReactFlow
                        nodes={nodes}
                        onNodesChange={onNodesChange}
                        edges={edges}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        edgeTypes={{ buttonedge: EdgeButton }}
                        style={{ backgroundColor: '#d9d9d9' }}
                    >
                        <Panel position="top-left">
                            <Box component='div'>
                                <Button
                                    id="demo-positioned-button"
                                    variant="outlined"
                                    aria-controls={openMenu ? 'demo-positioned-menu' : undefined}
                                    aria-haspopup="true"
                                    aria-expanded={openMenu ? 'true' : undefined}
                                    onClick={handleClickOpenMenu}
                                >
                                    Novo Elemento
                                </Button>
                                <Menu
                                    id="demo-positioned-menu"
                                    aria-labelledby="demo-positioned-button"
                                    anchorEl={anchorEl}
                                    open={openMenu}
                                    onClose={handleClickCloseMenu}
                                    anchorOrigin={{
                                        vertical: 'top',
                                        horizontal: 'left',
                                    }}
                                    transformOrigin={{
                                        vertical: 'top',
                                        horizontal: 'left',
                                    }}
                                >
                                    <MenuItem disabled onClick={(e) => { handleClickCloseMenu(e); createNewNode('start') }}>Inicio</MenuItem>
                                    <MenuItem onClick={(e) => { handleClickCloseMenu(e); createNewNode('cond') }}>Pergunta</MenuItem>
                                    <MenuItem onClick={(e) => { handleClickCloseMenu(e); createNewNode('end') }}>Finalizar / Transferir</MenuItem>
                                </Menu>
                            </Box>
                        </Panel>
                        <Panel position="top-right">
                            <Button onClick={e => viewData(e)} style={{ margin: 5 }} variant="outlined">Ver Dados</Button>
                            <Button onClick={e => saveData(e)} style={{ margin: 5 }} variant="outlined">Salvar em LocalStorage</Button>
                            <Button id='ClickZoon' onClick={e => handleTransform(positionX, positionY)} style={{ visibility: 0 }} variant="outlined"></Button>
                        </Panel>
                        <Panel position="bottom-right">
                            <Button style={{ marginBottom: '240%' }} onClick={e => { openChatbotModal(e); }} variant="text">
                                <ModeCommentIcon />
                            </Button>
                            <ChatBotTestModal
                                open={modalChatbotOpen}
                                onClose={setModalChatbotOpen}
                                chatBotFlow={chatBotFlow}
                            />
                        </Panel>
                        <Background variant={'lines'} />
                        <Controls />
                        <MiniMap nodeColor={nodeColor} nodeStrokeWidth={3} zoomable pannable />
                    </ReactFlow>
                </>
            </Box>

            <LateralMenu
                propsObject={getNodeProps(elementOnEdit)}
                open={confirmModalOpen}
                onClose={setConfirmModalOpen}
                queues={queues}
                onConfirm={(title, message, color, endOption, position) => EditNodeObjectProps(elementOnEdit, title, message, color, endOption, position)}
            />

        </Box >
    );
};


export default function () {
    return (
        <ReactFlowProvider>
            <ChatBotFlow />
        </ReactFlowProvider>
    );
};