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
        getAll: vi.fn().mockResolvedValue([]),
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

    })

    test('can sign up and then log in to reach Crowd Ideas', async () => {
        // Arrange: make getAll return [] first, then return the created user on refresh,
        // and make create return the created user
        (Users.getAll as any).mockResolvedValueOnce([]).mockResolvedValueOnce([{ username: 'newuser', password: 'newpass' }]); 
        (Users.create as any).mockResolvedValue({ username: 'newuser', password: 'newpass' })

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
        // Ensure no users exist
        (Users.getAll as any).mockResolvedValue([])

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

})


