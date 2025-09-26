import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { App } from '../pages/App'

describe('App', () => {
  it('lists, creates and votes ideas', async () => {
    render(<App />)

    // list populated by MSW
    expect(await screen.findByText('Dark Mode')).toBeInTheDocument()

    // create
    await userEvent.type(screen.getByPlaceholderText('Idea title'), 'Search Feature')
    await userEvent.type(screen.getByPlaceholderText('Description'), 'Add search')
    await userEvent.click(screen.getByRole('button', { name: /add/i }))

    // new item should be visible after refetch
    expect(await screen.findByText('Search Feature')).toBeInTheDocument()

    // vote button exists and can be clicked (MSW returns 204)
    await userEvent.click(screen.getAllByRole('button', { name: /vote/i })[0])
  })
})

