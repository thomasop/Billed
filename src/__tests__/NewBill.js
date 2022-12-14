/**
 * @jest-environment jsdom
 */

import { screen, waitFor, fireEvent } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import { bills } from "../fixtures/bills.js"
import router from "../app/Router.js";
import { ROUTES_PATH, ROUTES } from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import NewBill from "../containers/NewBill.js"

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then icon-mail should be active", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getByTestId('icon-mail'))
      const icon = screen.getByTestId('icon-mail')
      expect(icon.classList.contains('active-icon'))
    })
    describe("When I upload file", () => {
      test("Then file extension should be correct", async () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        document.body.innerHTML = NewBillUI()
        const newBill = new NewBill({ document, onNavigate, localStorage: window.localStorage })
        const fileInput = screen.getByTestId('file')
        fireEvent.input(fileInput, { target: {
          files: [new File(['image.png'], 'image.png', {type: 'image/png'})],
        } });
        expect(fileInput.value).toBeDefined();
      })
      test("Then file extension should be not correct", async () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        document.body.innerHTML = NewBillUI()
        const newBill = new NewBill({ document, onNavigate, localStorage: window.localStorage })
        const fileInput = screen.getByTestId('file')
        fireEvent.input(fileInput, { target: {
          files: [new File(['image.pdf'], 'image.pdf', {type: 'image/png'})],
        } });
        expect(fileInput.value).not.toBeDefined();
      })
    })
    describe("When I submit form", () => {
      test("Then bill is create", async () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        document.body.innerHTML = NewBillUI()
        const newBill = new NewBill({ document, onNavigate, localStorage: window.localStorage })
        const form = screen.getByTestId('form-new-bill')
        const expenseType = screen.getByTestId('expense-type')
        fireEvent.input(expenseType, { target: {value: "Transports"} });
        const expenseName = screen.getByTestId('expense-name')
        fireEvent.input(expenseName, { target: {value: "nom"} });
        const datepicker = screen.getByTestId('datepicker')
        fireEvent.input(datepicker, { target: {value: "2020-05-24"} });
        const amount = screen.getByTestId('amount')
        fireEvent.input(amount, { target: {value: 11} });
        const vat = screen.getByTestId('vat')
        fireEvent.input(vat, { target: {value: 11} });
        const pct = screen.getByTestId('pct')
        fireEvent.input(pct, { target: {value: 11} });
        const commentary = screen.getByTestId('commentary')
        fireEvent.input(commentary, { target: {value: "comment"} });
        const file = screen.getByTestId('file')
        fireEvent.input(file, { target: {
          files: [new File(['image.pdf'], 'image.pdf', {type: 'image/png'})],
        } });
        const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
        form.addEventListener("submit", handleSubmit);
        fireEvent.submit(form)
        expect(handleSubmit).toHaveBeenCalled()
        const pageBills = screen.getByTestId('icon-window')
        expect(pageBills.classList.contains('active-icon')).toBeDefined()
      })
    })
  })
})
