import ReactDOM from 'react-dom/client';
import React, {useEffect, useState} from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import {App} from './App'
import './index.css'
import { Users, type User } from '../api/client'  // Add this line

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

    const [userPairs, setUserPairs] = useState<Set<[string, string]>>(new Set());

    useEffect(() => {
        Users.getAll().then((users) => {
            const pairs = new Set<[string, string]>(users.map((u: User) => [u.username, u.password]));
            setUserPairs(pairs);
        });
    }, []);

    print(userPairs);

    const [username, set_user_name] = useState('');
    const [password, set_password] = useState('');
    const [login_username, set_login_user_name] = useState('');
    const [login_password, set_login_password] = useState('');

    async function handle_signup(e: React.FormEvent) {
        e.preventDefault();
        
        try {
            // Call the backend API to create a new user
            const newUser = await Users.create({
                username: username,
                password: password
            });
            
            alert(`User created successfully! Username: ${newUser.username}`);
            
            // Refresh the user pairs to include the new user
            const updatedUsers = await Users.getAll();
            const pairs = new Set<[string, string]>(updatedUsers.map((u: User) => [u.username, u.password]));
            setUserPairs(pairs);
            
            set_user_name(''); // clear input
            set_password('');
        } catch (error) {
            console.error('Error creating user:', error);
            alert('Failed to create user. Username might already exist.');
        }
    }

    const navigate = useNavigate();

    function handle_login(e: React.FormEvent) {
        e.preventDefault();

        const savedInPairs = [...userPairs].some(([u, p]) => u === login_username && p === login_password);
        if (savedInPairs) {
            navigate('/home');
        } else {
            alert('stop trying to cheat your way into the system. sign up before you try to login in dumbass');
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

async function fetchUsers() {
    const users = await Users.getAll();
    console.log(users);
    return users;
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
