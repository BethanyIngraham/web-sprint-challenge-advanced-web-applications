import Spinner from "./Spinner"
import React from "react"
import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"

// Import the Spinner component into this file and test
// that it renders what it should for the different props it can take.
test('spinner component renders properly with props it has', () => {
  const {rerender} = render(<Spinner on={true}/>)
  expect(screen.queryByText('Please wait...')).toBeInTheDocument()
  rerender(<Spinner on={false}/>)
  expect(screen.queryByText('Please wait...')).not.toBeInTheDocument()
})
