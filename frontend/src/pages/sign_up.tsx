import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css'
import { Users } from '../api/client'  // Add this line

function print(s: any) {
    console.log(s);
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function SignUp() { 

    useEffect(() => {
        document.title = 'sign up';
    }, []);

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
            
            set_user_name(''); // clear input
            set_password('');
        } catch (error) {
            console.error('Error creating user:', error);
            alert('Failed to create user. Username might already exist.');
        }
    }

    const navigate = useNavigate();

    async function handle_login(e: React.FormEvent) {
        e.preventDefault();

        try {
            // Call backend to get user by username
            const user = await Users.getByUsername(login_username);
            if (user && user.password === login_password) {
                navigate('/home');
            } else {
                alert('stop trying to cheat your way into the system. sign up before you try to login in dumbass');
            }
        } catch (error) {
            console.error('Error during login:', error);
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

