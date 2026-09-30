const DB_KEY='efile_db_v1';
const SESSION_KEY='efile_session_v1';
function getDB(){
    let db=JSON.parse(
        localStorage.getItem(DB_KEY)||'null'
    );
    if(!db){
        db={users:[],
            files:[],folders:[{
                id:'root',name:'My Files',parentId:null}],
                shares:[]
            };
        localStorage.setItem(DB_KEY,JSON.stringify(db))
    }return db
}
function saveDB(db){
    localStorage.setItem(DB_KEY,JSON.stringify(db))
}
function currentUser(){
    const id=localStorage.getItem(SESSION_KEY);
    return getDB()
    .users.find(u=>u.id===id)||null
}
function setSession(id){
    localStorage.setItem(SESSION_KEY,id)
}
function clearSession(){
    localStorage.removeItem(SESSION_KEY)
}
function uid(){
    return Date.now().toString(36)+Math.random().toString(36).slice(2,8)
}
function seedUserFiles(user){
    const db=getDB();
    if(db.files.some(f=>f.userId===user.id))return;
db.files
.push(
{id:uid(),userId:user
    .id,name:'Project Proposal.pdf',
    size:2457600,
    type:'PDF',
    category:'Documents',
    folderId:'root',
    created:Date.now()-86400000*1,trashed:false
},
{
    id:uid(),
    userId:user.id,
    name:'Meeting Notes.docx',
    size:860160,
    type:'DOCX',
    category:'Documents',
    folderId:'root',
    created:Date.now()-86400000*2,
    trashed:false
},
{
    id:uid(),
    userId:user.id,
    name:'Brand Assets.png',
    size:1843200,
    type:'PNG',
    category:'Images',
    folderId:'root',
    created:Date.now()-86400000*4,
    trashed:false
}
);
saveDB(db)
}
