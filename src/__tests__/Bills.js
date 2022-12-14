/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH, ROUTES } from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import Bills from "../containers/Bills"
import router from "../app/Router.js";
import userEvent from '@testing-library/user-event'
import store from "../app/Store.js"

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      expect(windowIcon.classList.contains('active-icon'))
    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
    describe("When I click on eye icon", () => {
      test("Then, I should return the image", async () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        document.body.innerHTML = BillsUI({ data: bills })
        $.fn.modal = jest.fn()
        const icon = screen.getAllByTestId('icon-eye')[0]
        const bill = new Bills({ document, onNavigate, localStorage: window.localStorage })
        const handleClickModal = jest.fn(() => bill.handleClickIconEye(icon))
        icon.addEventListener('click', handleClickModal)
        userEvent.click(icon)
        await waitFor(() => screen.getByTestId('modal'))
        const modal = screen.getByTestId('modal')
        expect(handleClickModal).toHaveBeenCalled()
        const modalImg = screen.getByTestId('modalImg')
        expect(modalImg).toBeTruthy()
      })
    })
    describe("When I click on new bill", () => {
      test("Then, I should be on new bill page", () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        document.body.innerHTML = BillsUI({ data: bills })
        const newBill = screen.getByTestId('btn-new-bill')
        const bill = new Bills({ document, onNavigate, localStorage: window.localStorage })
        const handleClickNewBill = jest.fn(() => bill.handleClickNewBill())
        newBill.addEventListener('click', handleClickNewBill)
        userEvent.click(newBill)
        expect(handleClickNewBill).toHaveBeenCalled()
        const newPageBill = screen.getByTestId('icon-mail')
        expect(newPageBill.classList.contains('active-icon')).toBeDefined()
      })
    })
  })
})
