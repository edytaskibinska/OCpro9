/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom/extend-expect";
import "@testing-library/jest-dom";
import { screen, waitFor, fireEvent, wait } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES_PATH, ROUTES } from "../constants/routes.js";
import router from "../app/Router.js";
import userEvent from "@testing-library/user-event";
import { bills } from "../fixtures/bills.js";

import mockStore from "../__mocks__/store";

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then the form appears and icon email is highlited", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);
      await waitFor(() => screen.getByTestId("form-new-bill"));
      await waitFor(() => screen.getByTestId("icon-mail"));
      const emailIcon = screen.getByTestId("icon-mail");
      expect(emailIcon).toBeTruthy();
      expect(emailIcon.classList.contains("active-icon")).toBe(true);
      const html = NewBillUI();
      document.body.innerHTML = html;

      const formBill = screen.getByTestId("form-new-bill");
      expect(formBill).toBeTruthy();
    });

   
  });
});

describe("Given that I am on new bill page", () => {
  describe("When I do not fill fields ", () => {
    test("Then It should renders the form page", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      const inputTypeDepense = screen.getByTestId("expense-type");
      expect(inputTypeDepense.value).toBe("Transports");

      const inputNomDepense = screen.getByTestId("expense-name");
      expect(inputNomDepense.value).toBe("");

      const inputDate = screen.getByTestId("datepicker");
      expect(inputDate.value).toBe("");

      const inpuMontant = screen.getByTestId("amount");
      expect(inpuMontant.value).toBe("");

      const inpuTva1 = screen.getByTestId("vat");
      expect(inpuTva1.value).toBe("");

      const inpuTva2 = screen.getByTestId("pct");
      expect(inpuTva2.value).toBe("");

      const inputComment = screen.getByTestId("commentary");
      expect(inputComment.value).toBe("");

      const inputFile = screen.getByTestId("file");
      expect(inputFile.value).toBe("");

      const form = screen.getByTestId("form-new-bill");
      const handleSubmit = jest.fn((e) => e.preventDefault());
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(screen.getByTestId("form-new-bill")).toBeTruthy();
    });
  });
});

describe("Given that I am on new bill page", () => {
  let file;
  beforeEach(() => {
    file = new File(["img"], "bill.jpg", { type: "image/jpg" });
  });
  describe("When I submit a valid form", () => {
    it("Then a new bill should have been added", async () => {
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const formulaire = screen.getByTestId("form-new-bill");
      const inputTypeDepense = screen.getByTestId("expense-type");
      const inputNomDepense = screen.getByTestId("expense-name");
      const inputDate = screen.getByTestId("datepicker");
      const inpuMontant = screen.getByTestId("amount");
      const inpuTva1 = screen.getByTestId("vat");
      const inpuTva2 = screen.getByTestId("pct");
      const inputComment = screen.getByTestId("commentary");
      const inputFile = screen.getByTestId("file");
      const errorMessage = screen.getByTestId("error-mess");

      const formValues = {
        type: "Fornitures de bureau",
        name: "Bureau en bois de teck",
        date: "2022-10-01",
        amount: "150",
        vat: 20,
        pct: 10,
        commentary: "Bureau du chef de projet",
        file: file,
      };

      fireEvent.change(inputTypeDepense, {
        target: { value: formValues.type },
      });
      fireEvent.change(inputNomDepense, { target: { value: formValues.name } });
      fireEvent.change(inputDate, { target: { value: formValues.date } });
      fireEvent.change(inpuMontant, { target: { value: formValues.amount } });
      fireEvent.change(inpuTva1, { target: { value: formValues.vat } });
      fireEvent.change(inpuTva2, { target: { value: formValues.pct } });
      fireEvent.change(inputComment, {
        target: { value: formValues.commentary },
      });

      //  simulate ulpoad event and wait until finish
      const onFileChange = jest.fn((e) => newBill.handleChangeFile(e));

      await waitFor(() => {
        fireEvent.change(inputFile, {
          target: { files: [file] },
        });
        inputFile.addEventListener("change", onFileChange);
        userEvent.upload(inputFile, file);
      });
      expect(onFileChange).toHaveBeenCalled();

      userEvent.upload(inputFile, formValues.file);

      // simulatin od submit function
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
      formulaire.addEventListener("submit", handleSubmit);
      fireEvent.submit(formulaire);
      expect(handleSubmit).toHaveBeenCalled();
      expect(inputTypeDepense.validity.valid).not.toBeTruthy();
      expect(inputNomDepense.validity.valid).toBeTruthy();
      expect(inputDate.validity.valid).toBeTruthy();
      expect(inpuTva1.validity.valid).toBeTruthy();
      expect(inpuTva2.validity.valid).toBeTruthy();
      expect(inputComment.validity.valid).toBeTruthy();
      expect(inputFile.files[0]).toBeDefined();
      // check if the file is there
      expect(inputFile.files[0].name).toBe("bill.jpg");
      expect(inputFile.files.length).toBe(1);
      //if errorMessageonly have class "error-mess" that means there is no errors
      expect(errorMessage).toHaveClass("error-mess");
    });
  });
});

describe("Given I am on new bill page", () => {
  describe("When I am uploading test.pdf ", () => {
    beforeEach(() => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "jhondoe@mail.com",
        })
      );
    });

    test("Then an error message for the file input should be displayed", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const newBill = new NewBill({
        document,
        onNavigate,
        store: null,
        bills: bills,
        localStorage: window.localStorage,
      });

      const inputFile = document.querySelector(`input[data-testid="file"]`);

      const errorMessage = screen.getByTestId("error-mess");

      const onFileChange = jest.fn((e) => newBill.handleChangeFile(e));

      const filePDF = new File(["img"], "test.pdf", { type: "text/pdf" });

      const extension = /([a-z 0-9])+(.jpg|.jpeg|.png)/gi;
      inputFile.addEventListener("change", onFileChange);
      userEvent.upload(inputFile, filePDF);

      expect(onFileChange).toHaveBeenCalled();
      expect(inputFile.files[0]).toStrictEqual(filePDF);
      expect(inputFile.files[0].name).not.toMatch(extension);
      expect(errorMessage).toHaveClass("error-mess visible");
      expect(
        screen.getByText(
          `Format de fichier est invalide (.jpg, .jpeg, .png sont autorisés)`
        )
      ).toBeTruthy();

      const form = screen.getByTestId("form-new-bill");
      const handleFormSubmit = jest.fn((evt) => newBill.handleSubmit(evt));
      form.addEventListener("submit", handleFormSubmit);
      fireEvent.submit(form);
      expect(handleFormSubmit).toHaveBeenCalled();
      expect(form).toBeTruthy();
    });

    test("Then an error message for the file input should not be displayed", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const newBill = new NewBill({
        document,
        onNavigate,
        store: null,
        bills: bills,
        localStorage: window.localStorage,
      });

      const inputFile = document.querySelector(`input[data-testid="file"]`);

      const onFileChange = jest.fn((e) => newBill.handleChangeFile(e));

      const filePNG = new File(["hello"], "hello.jpg", { type: "image/jpg" });
      const extension = /([a-z 0-9])+(.jpg|.jpeg|.png)/gi;
      inputFile.addEventListener("change", onFileChange);
      userEvent.upload(inputFile, filePNG);
      expect(onFileChange).toHaveBeenCalled();
      expect(inputFile.files[0]).toStrictEqual(filePNG);
      expect(inputFile.files[0].name).toMatch(extension);
    });
  });
});

describe("Given I am connected as an employéé and on NewBill page", () => {
  beforeEach(() => {
    jest.mock("../app/store", () => mockStore);

    const html = NewBillUI();
    document.body.innerHTML = html;
    Object.defineProperty(window, "localStorage", { value: localStorageMock });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
        email: "email@email.com",
      })
    );
  });

  //************* error 404
  describe("When an error 404 occurres on submit", () => {
    it("Then a warning should be displayed on console", async () => {
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      jest.spyOn(mockStore, "bills");
      console.error = jest.fn();

      mockStore.bills.mockImplementationOnce(() => {
        return {
          update: () => {
            return Promise.reject(new Error("Erreur 404"));
          },
        };
      });

      const formulaire = screen.getByTestId("form-new-bill");
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
      formulaire.addEventListener("submit", handleSubmit);
      fireEvent.submit(formulaire);

      await new Promise(process.nextTick);
      expect(console.error).toBeCalled();
    });
  });

  //************* test error 500
  describe("When an error 500 occurres on submit", () => {
    it("Then a warning should be displayed on console", async () => {
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      jest.spyOn(mockStore, "bills");
      console.error = jest.fn();

      // mockImplementationOnce : Accepts a function that will be used as an implementation of the mock for one call to the mocked function.
      mockStore.bills.mockImplementationOnce(() => {
        return {
          update: () => {
            return Promise.reject(new Error("Erreur 500"));
          },
        };
      });

      const formulaire = screen.getByTestId("form-new-bill");
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
      formulaire.addEventListener("submit", handleSubmit);
      fireEvent.submit(formulaire);

      await new Promise(process.nextTick);
      expect(console.error).toBeCalled();
    });
  });
});
