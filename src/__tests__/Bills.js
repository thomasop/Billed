/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import Bills from "../containers/Bills.js"
import { ROUTES_PATH, ROUTES } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"
import router from "../app/Router";

jest.mock("../app/Store.js", () => mockStore)

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
      expect(windowIcon.classList.contains('active-icon')).toBeTruthy()
    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
    describe("When I click on new bill", () => {
      test("Then, I should be on new bill page", () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        document.body.innerHTML = BillsUI({ data: bills })
        const newBill = screen.getByTestId('btn-new-bill')
        const bill = new Bills({ document, onNavigate, store: null, localStorage: window.localStorage })
        const handleClickNewBill = jest.fn(bill.handleClickNewBill())
        newBill.addEventListener('click', handleClickNewBill)
        userEvent.click(newBill)
        expect(handleClickNewBill).toHaveBeenCalled()
        expect(screen.getAllByText('Envoyer une note de frais')).toBeTruthy()
      })
    })
    describe("When I click on eye icon", () => {
      test("Then, I should return the modal", () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        Object.defineProperty(window, "localStorage", { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
            type: "Employee"
          })
        )
        document.body.innerHTML = BillsUI({ data: bills })
        const bill = new Bills({ document, onNavigate, store: null, localStorage: window.localStorage })
        $.fn.modal = jest.fn()
        const icon = screen.getAllByTestId('icon-eye')[0]
        const handleClickModal = jest.fn(() => bill.handleClickIconEye(icon))
        icon.addEventListener('click', handleClickModal)
        userEvent.click(icon)
        expect(handleClickModal).toHaveBeenCalled()
        const modalImg = screen.getByTestId('modalImg')
        expect(modalImg).toBeTruthy()
        expect(screen.getAllByText('Justificatif')).toBeTruthy()
      })
    })
  })
})

describe("Given I am connected as an employee", () => { 
  describe("When I am on Bills Page", () => {
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      document.body.innerHTML = BillsUI({ data: bills})
      await waitFor(() => screen.getAllByTestId("billdata"))
      const billsData  = await screen.getAllByTestId("billdata")
      expect(billsData.length).toBe(4)
    })
    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills")
        Object.defineProperty(
            window,
            'localStorage',
            { value: localStorageMock }
        )
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee',
          email: "a@a"
        }))
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.appendChild(root)
        router()
      })
      test("fetches bills from an API and fails with 404 message error", async () => {

        mockStore.bills.mockImplementationOnce(() => {
          return {
            list : () =>  {
              return Promise.reject(new Error("Erreur 404"))
            }
          }})
        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 404/)
        expect(message).toBeTruthy()
      })

      test("fetches messages from an API and fails with 500 message error", async () => {

        mockStore.bills.mockImplementationOnce(() => {
          return {
            list : () =>  {
              return Promise.reject(new Error("Erreur 500"))
            }
          }})

        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 500/)
        expect(message).toBeTruthy()
      })
    })
  })
})