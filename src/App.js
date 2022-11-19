import axios from "axios";
import {
    Alert,
    Button, CardContent, Stack,Card,CardActions, TextField, Typography
} from "@mui/material";
import Box from '@mui/material/Box';
import './App.css';
import {useState,useRef,useEffect} from "react";
import {DataGrid, useGridApiRef} from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import AddCard from '@mui/icons-material/AddCard';

var configdata = {
    method: 'get',
    url: 'http://10.120.2.223:8080/survey/getAllSurvey',
    headers: { }
};

function App() {
    const gridRef = useGridApiRef();
    const [renderItems,setRenderItems] = useState(null);
    const [renderQuestion,setRenderQuestion] = useState(false);
    const [rows, setsurveylist] = useState([]);
    const [selectedRow,setSelectedRow] = useState([]);

    useEffect(() => {
        axios(configdata)
            .then(function (response) {
                setsurveylist(response.data)
            })
            .catch(function (error) {
                console.log(error);
            });

    }, []);
    function SurveyGrid (){

        const columns = [
            {field: 'surveyName',headerName: 'SURVEY NAME',width: 150},{
                field: 'action',
                headerName: <div style={{marginLeft:55}}>
                    EDIT
                </div>,
                width: 180,
                sortable: false,
                disableClickEventBubbling: true,

                renderCell: (params) => {
                    return (<div >
                            <Button variant="outlined" color="error" size="small" startIcon={<AddCard/>} onClick={(e) => setRenderQuestion(true)} style={{width:150}}>ADD QUESTION</Button>
                        </div>
                    );
                },
            },{
                field: 'active',
                headerName: "ACTIVE",
                renderCell: AgGridCheckbox,
                editable: false
            },];


        return   <div style={{ height: 480, width: 440 ,marginLeft:5 ,marginTop:10 ,borderRadius:20}}>
            <DataGrid
                rows={rows}
                onRowClick={(e)=>setSelectedRow(e.row)}
                ref={gridRef}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5]}
            />
        </div>
    }
    function AgGridCheckbox(props) {
        const boolValue = props.value && props.value.toString() === 'true';
        const [isChecked, setIsChecked] = useState(boolValue);
        const onChanged = () => {
            props.setValue(!isChecked);
            setIsChecked(!isChecked);
        };
        return (
            <div>
                <input type="checkbox" name="aktif" disabled={true} checked={isChecked} onChange={onChanged}/>
            </div>
        );
    }

    const RederItems= () =>{//render olacak itemleri belirlemek için
        if (renderItems===true) {
            return <div >
                <Box
                    component="form"
                    sx={{
                        '& .MuiTextField-root': { m: 1, width: '25ch' },
                    }}
                    noValidate
                    autoComplete="off"
                    id="form4"
                >
                    <div>
                        <TextField
                            id="filled-multiline-static"
                            label="Survey Name"
                            name="SurveyName"
                            style={{marginLeft:5,width: 500,background:"white"}}
                            multiline
                            rows={2}
                            variant="filled"
                        />
                    </div>
                    <Button variant="contained" className="menuItem2" onClick={(e) => SaveSurvey()}> <span
                        id="saveButton"></span>Save</Button>
                </Box>
            </div>;
        }}

    const SaveSurvey= () =>{//Anket olusturmak icin
        var surveyName = document.querySelector('textarea[name = "SurveyName"]').value
        if(surveyName===""){
            return alert("Anket Adı Boş Olamaz");
        }
            var config = {
                method: 'post',
                url: 'http://10.120.2.223:8080/survey/addSurvey',
                headers: {
                    'Content-Type': 'application/json'
                },
                data :  JSON.stringify({
                    "surveyName": surveyName,
                    "active" : true,
                    "createdUserId": 1//todo aktif kullanıcı id
                })
            };

            axios(config)
                .then(function (response) {
                    axios(configdata)
                        .then(function (response) {
                            setsurveylist(response.data)
                            SurveyGrid()
                        })
                        .catch(function (error) {
                            console.log(error);
                        });
                    return alert("Success");
                })
                .catch(function (error) {
                    console.log(error);
                });
            return <div  style={{marginLeft:5,width: 500,background:"white"}} >

                <Stack  spacing={2}>
                    <Alert   severity="C">Success</Alert>
                </Stack>
            </div>;
        }

    const RederQuestion = () => {
        if(renderQuestion===true) {
            return<div >
                <Card sx={{ minWidth: 275 }} className="box-2" id="form3">
                    <CardContent>
                <Typography variant="h5" component="div">
                    {selectedRow.surveyName}
                </Typography>

                <div>
                    <TextField
                        id="filled-disabled"
                        label="Question"
                        name="QuestionValue"
                        style={{marginLeft: 5, width: 500, background: "white"}}
                        multiline
                        rows={5}
                        variant="filled"
                    />
                </div>


                    </CardContent>
                    <CardActions>
                        <Button  variant="contained" className="menuItem2" startIcon={<AddIcon/>} style={{background:"green",marginLeft:400}} onClick={(e) => AddQ()}> <span
                            id="saveButton"></span>ADD</Button>
                    </CardActions>
                </Card>
            </div>;
        }
    }
    const [rowsQ, setTheArray] = useState([]);
    const AddQ= (e) =>{
        var question = document.querySelector('textarea[name = "QuestionValue"]').value
        const obj = {'questionText': question, 'surveyId': selectedRow.id, id: rowsQ.length};
        setTheArray(oldArray => [...oldArray, obj]);
    }
    const SaveQuestions= (e) =>{
        debugger;
        for (let i = 0; i < rowsQ.length; i++) {
            rowsQ[i].id=null//amaç id leri boşaltmak saveoll metodu backend hatası veriyor
        }
        debugger;
            var data = JSON.stringify(rowsQ);
            var configSaveAll = {
                method: 'post',
                url: 'http://10.120.2.223:8080/question/saveAllQuestions',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: data
            };
            axios(configSaveAll)
                .then(function (response) {
                    setTheArray(response.data);

                    return alert(response.data.length.toString()+"- Save Success");

                })
                .catch(function (error) {
                    console.log(error);
                });
    }

    const RederQuestions = () => {
        const gridRef1 = useGridApiRef();
        if(renderQuestion===true) {
            const columnsQ = [
                {field: 'questionText',  headerName: <div style={{marginLeft:250}}>
                        QUESTIONS
                    </div>,width: 600}];

            console.log(JSON.stringify(rowsQ));
            return   <div  style={{ height: 500, width: 610   }} >
                <DataGrid
                    rows={rowsQ}
                    onRowClick={(e)=>setSelectedRow(e.row)}
                    ref={gridRef1}
                    columns={columnsQ}
                    pageSize={5}
                    rowsPerPageOptions={[5]}
                />
                <Button  variant="contained" className="menuItem2" startIcon={<SaveIcon/>} style={{background:"green"}} onClick={(e) => SaveQuestions()}> <span
                    id="saveButton"></span>SAVE ALL QUESTİON</Button>
            </div>
        }

    }

    /*const ShowInfo= () =>{
        if (info!=null) {
            return <div >

                    <Stack sx={{ width: '100%' }} spacing={2}>
                        <Alert severity="success">Success</Alert>
                    </Stack>
                <Button variant="contained" className="menuItem2" onClick={(e) => setShowInfo(null)}> <span
                    id="survey"></span>Ok</Button>
            </div>;
        }}*/


  return (
    <div className="App" >

      <header className="App-link">
        <p>
          Survey App
        </p>
          <RederItems/>

          <br/>
          <Button variant="contained" className="glow-on-hover" onClick={(e) => setRenderItems(true)}> <span
              id="surveyicon"></span>Add Survey</Button>,
      </header>
        <div className="table-1" >
            <div id="form">
                <SurveyGrid/>
            </div>
            <div>
                <RederQuestion/>
            </div>
            <div >
                <RederQuestions/>
            </div>
        </div>



    </div>
  );
}

export default App;
