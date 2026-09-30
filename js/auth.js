const loginForm=document.getElementById('loginForm'),
registerForm=document.getElementById('registerForm');
if(currentUser() && (loginForm||registerForm)){/* allow manual login page */}
if(registerForm)registerForm.addEventListener('submit',e=>{e.preventDefault();

    const name=regName.value.trim(),email=regEmail.value.trim().toLowerCase(),password=regPassword.value;
 
if(password!==regConfirm.value)return registerMsg.textContent='Passwords do not match.';
const db=getDB();
if(db.users.some(u=>u.email===email))return registerMsg.textContent='An account with this email already exists.';
const user={id:uid(),name,email,password,created:Date.now()

};
db.users.push(user);
saveDB(db);
setSession(user.id);
seedUserFiles(user);
location.href='dashboard.html'
});
if(loginForm)loginForm.addEventListener('submit',e=>{e.preventDefault();
    const email=loginEmail.value.trim().toLowerCase(),password=loginPassword.value, user=getDB().users.find(u=>u.email===email&&u.password===password);
    if(!user)return loginMsg.textContent='Incorrect email or password.';
    setSession(user.id);seedUserFiles(user);
    location.href='dashboard.html'
});
