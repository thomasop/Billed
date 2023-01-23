/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom"
import userEvent from '@testing-library/user-event';
import NewBillUI from "../views/NewBillUI.js"
import NewBill from '../containers/NewBill.js'
import { ROUTES, ROUTES_PATH } from '../constants/routes.js'
import { localStorageMock } from '../__mocks__/localStorage.js'
import mockStore from "../__mocks__/store"
import router from "../app/Router.js";

jest.mock("../app/Store.js", () => mockStore)

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
      expect(icon.classList.contains('active-icon')).toBeTruthy()
    })
    test(('Then, it should return all inputs'), () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      expect(screen.getByTestId('expense-type')).toBeTruthy()
      expect(screen.getByTestId('expense-name')).toBeTruthy()
      expect(screen.getByTestId('datepicker')).toBeTruthy()
      expect(screen.getByTestId('amount')).toBeTruthy()
      expect(screen.getByTestId('vat')).toBeTruthy()
      expect(screen.getByTestId('pct')).toBeTruthy()
      expect(screen.getByTestId('commentary')).toBeTruthy()
      expect(screen.getByTestId('file')).toBeTruthy()
      expect(screen.getByTestId('btn-send-bill')).toBeTruthy()
    })
    describe("When I complete input file", () => {
      describe("When it's PNG, JPG or JPEG", () => {
        test("Then It should not renders error message and display file in input", async () => {
          const onNavigate = (pathname) => {
            document.body.innerHTML = ROUTES({ pathname })
          }
          Object.defineProperty(window, 'localStorage', { value: localStorageMock })
          window.localStorage.setItem('user', JSON.stringify({
            type: 'Employee'
          }))
          document.body.innerHTML = NewBillUI()
          const newBills = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage })
          const handleChangeFile = jest.fn(newBills.handleChangeFile);
          const inputFile = screen.getByTestId('file')
          inputFile.addEventListener("change", handleChangeFile);
          
          userEvent.upload(inputFile, new File(['(--[IMG]--)'], 'testFile.png', {
            type: 'image/png'
          }))
          expect(handleChangeFile).toHaveBeenCalled()
          expect(handleChangeFile).toHaveBeenCalledTimes(1)
          expect(inputFile.classList.contains('is-invalid')).toBeFalsy()
          expect(inputFile.classList.contains('blue-border')).toBeTruthy()
        })
      })
      describe("When it's not PNG, JPG, JPEG", () => {
        test("It should renders error message and not display file in input", async () => {
          const onNavigate = (pathname) => {
            document.body.innerHTML = ROUTES({ pathname })
          }
          Object.defineProperty(window, 'localStorage', { value: localStorageMock })
          window.localStorage.setItem('user', JSON.stringify({
            type: 'Employee'
          }))
          document.body.innerHTML = NewBillUI()
          const newBills = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage })
          const handleChangeFile = jest.fn(newBills.handleChangeFile);
          const inputFile = screen.getByTestId('file')
          inputFile.addEventListener("change", handleChangeFile);
          
          userEvent.upload(inputFile, new File(['image.gif'], 'image.gif', {type: 'image/gif'}))
          expect(handleChangeFile).toHaveBeenCalled()
          expect(handleChangeFile).toHaveBeenCalledTimes(1)
          expect(inputFile.classList.contains('is-invalid')).toBeTruthy()
          expect(inputFile.classList.contains('blue-border')).toBeFalsy()
        })
      })
    })
  })
})

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    describe("When I submit form with valid input data", () => {
      test("Then bill is create", async () => {
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
            email: "employee@company.tld",
          })
        );
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.appendChild(root)
        router()
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({
            pathname
          });
        };
        window.onNavigate(ROUTES_PATH.NewBill)

        const newBill = new NewBill({ document, onNavigate, store:mockStore, localStorage: window.localStorage })
        document.body.innerHTML = NewBillUI();

        const inputType = screen.getByTestId("expense-type");
        userEvent.type(inputType, 'Transports')
        const inputName = screen.getByTestId("expense-name");
        userEvent.type(inputName, 'Vol Paris Londres')
        const inputDate = screen.getByTestId("datepicker");
        userEvent.type(inputDate, "2022-04-04");
        const inputAmount = screen.getByTestId("amount");
        userEvent.type(inputAmount, '348');
        const inputVat = screen.getByTestId("vat");
        userEvent.type(inputVat, '70');
        const inputPct = screen.getByTestId("pct");
        userEvent.type(inputPct, '20');
        const inputCommentary = screen.getByTestId("commentary");
        userEvent.type(inputCommentary, "...");

        newBill.fileName = 'testFile'
        newBill.fileUrl = 'https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a'
        const inputFile = screen.getByTestId("file");

        const formNewBill = screen.getByTestId("form-new-bill");
        const handleChangeFile = jest.fn(newBill.handleChangeFile)
        const handleSubmit = jest.spyOn(newBill, 'handleSubmit')
        const spyedMockStore = jest.spyOn(mockStore, 'bills')
        spyedMockStore.mockImplementation(()=> {
          return {
            create: () => {
              return Promise.resolve({fileUrl: `${newBill.fileUrl}`, key: '12345'})
            },
            update: () => {
              return Promise.resolve({
                "id": "47qAXb6fIm2zOKkLzMro",
                "vat": "80",
                "fileUrl": "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
                "status": "pending",
                "type": "Hôtel et logement",
                "commentary": "séminaire billed",
                "name": "encore",
                "fileName": "preview-facture-free-201801-pdf-1.jpg",
                "date": "2004-04-04",
                "amount": 400,
                "commentAdmin": "ok",
                "email": "a@a",
                "pct": 20
              })
            }
          }
        })
        
        inputFile.addEventListener('change', handleChangeFile)
        formNewBill.addEventListener('submit', handleSubmit)
        
        userEvent.upload(inputFile, new File(['(--[IMG]--)'], 'testFile.jpg', {
          type: 'image/jpg'
        }))
        fireEvent.submit(formNewBill)
        await spyedMockStore()
        expect(newBill.billId).not.toBeNull()
        expect(newBill.fileUrl).not.toBeNull()
        expect(handleChangeFile).toHaveBeenCalled()
        expect(handleChangeFile).toBeCalledTimes(1)
        expect(handleSubmit).toHaveBeenCalled()
        expect(handleSubmit).toBeCalledTimes(1)
        expect(mockStore.bills).toHaveBeenCalled()
        expect(mockStore.bills).toHaveBeenCalledTimes(3)
        expect(screen.getAllByText('Mes notes de frais')).toBeTruthy()
      })
    })
  })
})