import ReactDOM from 'react-dom/client';
import React, {useEffect, useState} from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import {App} from './App'
import './index.css'

function print(s: any) {
    console.log(s);
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function SignUp() { 

    useEffect(() => {
        document.title = 'sign up';
    }, []);

    const [username, set_user_name] = useState('');
    const [password, set_password] = useState('');
    const [login_username, set_login_user_name] = useState('');
    const [login_password, set_login_password] = useState('');
    const [saved_username, set_saved_username] = useState('');
    const [saved_password, set_saved_password] = useState('');

    function handle_signup(e: React.FormEvent) {
        e.preventDefault();
        alert(`username: ${username}, password: ${password}`);
        set_saved_username(username);
        set_saved_password(password);
        set_user_name(''); // clear input
        set_password('');
    }

    useEffect(() => {
        if (saved_username || saved_password) {
            alert(`saved username: ${saved_username}, saved password: ${saved_password}`);
        }
    }, [saved_username, saved_password]);

    const navigate = useNavigate();

    function handle_login(e: React.FormEvent) {
        e.preventDefault();
        if (login_username === saved_username && login_password === saved_password) {
            navigate('/home');
        }
    }

    return (
        <main>
            <div>sign up</div>
            
            <form onSubmit={handle_signup}>
                <div>
                    enter username: 
                    <input
                        value={username}
                        onChange={(e) => set_user_name(e.target.value)}
                    />
                </div>
               
                <div>
                    enter password: 
                    <input
                        value={password}
                        onChange={(e) => set_password(e.target.value)}
                    />
                </div>

                <button type="submit">submit</button>
            </form>
            
            <br></br>
            <div>login</div>

            <form onSubmit={handle_login}>
                <div>
                    enter username: 
                    <input
                        value={login_username}
                        onChange={(e) => set_login_user_name(e.target.value)}
                    />
                </div>
               
                <div>
                    enter password: 
                    <input
                        value={login_password}
                        onChange={(e) => set_login_password(e.target.value)}
                    />
                </div>

                <button type="submit">submit</button>
            </form>

            

        </main>
    ); 
}

function Home() {
    useEffect(() => { document.title = 'home'; }, []);
    return (
        <main>
            <h1>Home</h1>
            <p>Logged in!</p>
        </main>
    );
}


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SignUp />} />
        <Route path="/home" element={<App></App>} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
