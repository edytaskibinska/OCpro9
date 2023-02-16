/**
 * @jest-environment jsdom
 */
import { screen, waitFor, fireEvent } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH, ROUTES } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import userEvent from "@testing-library/user-event";
import router from "../app/Router.js";
import Bills from "../containers/Bills.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
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
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");

      expect(windowIcon).toBeTruthy();
      expect(windowIcon.classList.contains("active-icon")).toBe(true);
    });
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);

      expect(dates).toEqual(datesSorted);
    });

    test("Click on new bill button", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const store = jest.fn();
      const bill = new Bills({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });
      const handleClick = jest.fn((e) => bill.handleClickNewBill(e));
      const btnNewBill = screen.getByTestId("btn-new-bill");
      btnNewBill.addEventListener("click", handleClick);
      userEvent.click(btnNewBill);

      expect(handleClick).toHaveBeenCalled();
    });
  });

  test("Click on icon eye and fire function", async () => {
    window.$ = jest.fn().mockImplementation(() => {
      return {
        modal: jest.fn(),
        click: jest.fn(),
        find: jest.fn(),
        html: jest.fn(),
        width: jest.fn(),
      };
    });
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
    });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
      })
    );
    const store = jest.fn();
    const bill = new Bills({
      document,
      onNavigate,
      store,
      localStorage: window.localStorage,
    });

    document.body.innerHTML = BillsUI({ data: [bills[0]] });
    await waitFor(() => screen.getByTestId("icon-eye"));
    const iconEye = screen.getByTestId("icon-eye");
    iconEye.setAttribute("data-bill-url", "https://fefef.com");
    const handleClickIcon = jest.fn((e) => bill.handleClickIconEye(e, iconEye));
    iconEye.setAttribute("onclick", handleClickIcon());

    expect(iconEye).toBeTruthy();

    iconEye.addEventListener("click", handleClickIcon);
    await waitFor(() => screen.getByTestId("modal"));
    const modal = screen.getByTestId("modal");

    expect(modal).toBeTruthy();
    expect(handleClickIcon).toHaveBeenCalled();
  });
});
