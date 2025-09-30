import {SignUp} from "../pages/sign_up"
import { describe, test, expect, vi } from "vitest"
import { render, screen, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { Users } from '../api/client'

// Mock the Users API
vi.mock('../api/client', () => ({
    Users: {
        getByUsername: vi.fn(),
        create: vi.fn().mockResolvedValue({ username: 'test', password: 'test' })
    }
}))

describe('sign up', () => {
    test('screen exists', async () => {
        await act(async () => {
            render(
                <BrowserRouter>
                    <SignUp />
                </BrowserRouter>
            )
        })

        expect(screen.getByText("sign up")).toBeInTheDocument()
        expect(screen.getByText("login")).toBeInTheDocument()

        // Check that there are exactly 2 instances of "enter username:"
        const usernameLabels = screen.getAllByText("enter username:")
        expect(usernameLabels).toHaveLength(2)
        
        // Check that there are exactly 2 instances of "enter password:"
        const passwordLabels = screen.getAllByText("enter password:")
        expect(passwordLabels).toHaveLength(2)
    })

    test('can sign up and then log in to reach Crowd Ideas', async () => {
        // Mock create to return the new user
        (Users.create as any).mockResolvedValue({ username: 'newuser', password: 'newpass' }); 
        
        // Mock getByUsername to return null first (user doesn't exist), then return the user after signup
        (Users.getByUsername as any).mockResolvedValue({ username: 'newuser', password: 'newpass' })

        const user = userEvent.setup()

        await act(async () => {
            render(
                <MemoryRouter initialEntries={['/signup']}>
                    <Routes>
                        <Route path="/signup" element={<SignUp />} />
                        <Route path="/home" element={<div>Crowd Ideas</div>} />
                    </Routes>
                </MemoryRouter>
            )
        })

        // There are 4 text inputs: signup username, signup password, login username, login password
        const inputs = screen.getAllByRole('textbox')
        const signupUsername = inputs[0]
        const signupPassword = inputs[1]
        const loginUsername = inputs[2]
        const loginPassword = inputs[3]

        // Act: sign up
        await user.type(signupUsername, 'newuser')
        await user.type(signupPassword, 'newpass')

        const buttons = screen.getAllByRole('button')
        const signupButton = buttons[0]
        await user.click(signupButton)

        // Act: log in with the new credentials
        await user.type(loginUsername, 'newuser')
        await user.type(loginPassword, 'newpass')
        const loginButton = buttons[1]
        await user.click(loginButton)

        // Assert: navigation to /home shows "Crowd Ideas"
        const homeText = await screen.findByText('Crowd Ideas')
        expect(homeText).toBeInTheDocument()
    })

    test('shows alert when logging in with unknown credentials', async () => {
        // Mock getByUsername to return null (user doesn't exist)
        (Users.getByUsername as any).mockResolvedValue(null)

        const user = userEvent.setup()
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

        await act(async () => {
            render(
                <BrowserRouter>
                    <SignUp />
                </BrowserRouter>
            )
        })

        // There are 4 text inputs: signup username, signup password, login username, login password
        const inputs = screen.getAllByRole('textbox')
        const loginUsername = inputs[2]
        const loginPassword = inputs[3]

        await user.type(loginUsername, 'unknown')
        await user.type(loginPassword, 'wrongpass')

        const buttons = screen.getAllByRole('button')
        const loginButton = buttons[1]
        await user.click(loginButton)

        expect(alertSpy).toHaveBeenCalledWith('stop trying to cheat your way into the system. sign up before you try to login in dumbass')

        alertSpy.mockRestore()
    })

    test('shows alert when logging in with wrong password', async () => {
        // Mock getByUsername to return user with different password
        (Users.getByUsername as any).mockResolvedValue({ username: 'existinguser', password: 'correctpass' })

        const user = userEvent.setup()
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

        await act(async () => {
            render(
                <BrowserRouter>
                    <SignUp />
                </BrowserRouter>
            )
        })

        const inputs = screen.getAllByRole('textbox')
        const loginUsername = inputs[2]
        const loginPassword = inputs[3]

        await user.type(loginUsername, 'existinguser')
        await user.type(loginPassword, 'wrongpass')

        const buttons = screen.getAllByRole('button')
        const loginButton = buttons[1]
        await user.click(loginButton)

        expect(alertSpy).toHaveBeenCalledWith('stop trying to cheat your way into the system. sign up before you try to login in dumbass')

        alertSpy.mockRestore()
    })

    test('shows alert when signing up with an existing username (Users.create throws)', async () => {
        // Make Users.create reject (simulate existing username / server error)
        (Users.create as any).mockRejectedValue(new Error('User exists'))

        const user = userEvent.setup()
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

        await act(async () => {
            render(
                <BrowserRouter>
                    <SignUp />
                </BrowserRouter>
            )
        })

        const inputs = screen.getAllByRole('textbox')
        const signupUsername = inputs[0]
        const signupPassword = inputs[1]

        await user.type(signupUsername, 'existinguser')
        await user.type(signupPassword, 'anyPass')

        const buttons = screen.getAllByRole('button')
        const signupButton = buttons[0]
        await user.click(signupButton)

        // Expect the signup error alert to be shown
        expect(alertSpy).toHaveBeenCalledWith('Failed to create user. Username might already exist.')

        alertSpy.mockRestore()
    })

})


