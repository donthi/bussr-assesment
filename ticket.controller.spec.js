const TicketController = require("./ticket.controller");
const Ticket = require("./ticket.model");

describe("Ticket Controller tests", () => {
  describe("getAll tests", () => {
    it("should get all the tickets", async () => {
      const h = {
        response: (tickets) => tickets,
      };
      const mockTickets = new Array(10).fill(0).map((x, i) => {
        return {
          id: i,
        };
      });
      jest.spyOn(Ticket, "find").mockImplementation(() => ({
        exec: () => Promise.resolve(mockTickets),
      }));

      const tickets = await TicketController.getAll({}, h);

      // expect(h.response).toHaveBeenCalledTimes(1)
      // expect(h.response).toBeCalledWith(mockTickets);
      expect(tickets).toStrictEqual(mockTickets);
    });
    it("should fail to get all the tickets", async () => {
      const h = {
        response: (err) => err,
      };
      const mockTickets = new Array(10).fill(0).map((x, i) => {
        return {
          id: i,
        };
      });
      const mockError = new Error("mock error");
      jest.spyOn(Ticket, "find").mockImplementation(() => ({
        exec: () => Promise.reject(mockError),
      }));

      const error = await TicketController.getAll({}, h);

      // expect(h.response).toHaveBeenCalledTimes(1)
      // expect(h.response).toBeCalledWith(mockTickets);
      expect(error).toStrictEqual(mockError);
    });
  });
  describe("Get profits by month tests", () => {
    it("should return profits by method db aggregate", async () => {
      const ticketsFromDb = [{ _id: 1, totalProfit: 100 }];

      const aggregateStub = jest
        .spyOn(Ticket, "aggregate")
        .mockImplementation((args) => {
          return {
            exec: () => Promise.resolve(ticketsFromDb),
          };
        });

      const totalProfitsByMonth = await TicketController.getProfitsByMonth(
        { query: { method: "aggregate" } },
        { response: (obj) => obj }
      );

      expect(aggregateStub).toBeCalledWith([
        {
          $group: {
            _id: { $month: "$performanceTime" },
            totalProfit: {
              $sum: "$ticketPrice",
            },
          },
        },
      ]);
      expect(totalProfitsByMonth).toStrictEqual([
        {
          month: "January",
          totalProfit: 100,
        },
      ]);
    });

    it("should return profits by method js", async () => {
      const ticketsFromDb = [];

      ticketsFromDb.push({
        performanceTime: new Date(2021, 1, 20),
        ticketPrice: 80,
      });
      ticketsFromDb.push({
        performanceTime: new Date(2021, 1, 25),
        ticketPrice: 100,
      });
      ticketsFromDb.push({
        performanceTime: new Date(2021, 1, 1),
        ticketPrice: 20,
      });

      ticketsFromDb.push({
        performanceTime: new Date(2021, 2, 20),
        ticketPrice: 100,
      });
      ticketsFromDb.push({
        performanceTime: new Date(2021, 2, 25),
        ticketPrice: 100,
      });
      ticketsFromDb.push({
        performanceTime: new Date(2021, 2, 1),
        ticketPrice: 90,
      });

      const findStub = jest.spyOn(Ticket, "find").mockImplementation(() => ({
        exec: () => Promise.resolve(ticketsFromDb),
      }));

      const aggregateStub = jest.spyOn(Ticket, "aggregate");

      const profitsByMonth = await TicketController.getProfitsByMonth(
        { query: { method: "js" } },
        { response: (obj) => obj }
      );

      // expect(aggregateStub).not.toBeCalled()
      expect(profitsByMonth).toStrictEqual([
        {
          month: "February",
          totalProfit: 200,
        },
        {
          month: "March",
          totalProfit: 290,
        },
      ]);
    });
  });
  describe("Get visits by month tests", () => {
    it("should return visits by method db aggregate", async () => {
      const visitsFromDB = [{ _id: 1, totalVisits: 2 }];

      const aggregateStub = jest
        .spyOn(Ticket, "aggregate")
        .mockImplementation((args) => {
          return {
            exec: () => Promise.resolve(visitsFromDB),
          };
        });

      const totalVisitByMonth = await TicketController.getVisitsByMonth(
        { query: { method: "aggregate" } },
        { response: (obj) => obj }
      );

      expect(aggregateStub).toBeCalledWith([
        {
          $group: {
            _id: { $month: "$performanceTime" },
            totalVisits: {
              $sum: 1,
            },
          },
        },
      ]);
      expect(totalVisitByMonth).toStrictEqual([
        {
          month: "January",
          totalVisits: 2,
        },
      ]);
    });

    it("should return visits by method js", async () => {
      const ticketsFromDb = [];

      ticketsFromDb.push({
        performanceTime: new Date(2021, 1, 20),
        ticketPrice: 80,
      });
      ticketsFromDb.push({
        performanceTime: new Date(2021, 1, 25),
        ticketPrice: 100,
      });
      ticketsFromDb.push({
        performanceTime: new Date(2021, 1, 1),
        ticketPrice: 20,
      });

      ticketsFromDb.push({
        performanceTime: new Date(2021, 2, 20),
        ticketPrice: 100,
      });
      ticketsFromDb.push({
        performanceTime: new Date(2021, 2, 25),
        ticketPrice: 100,
      });
      ticketsFromDb.push({
        performanceTime: new Date(2021, 2, 1),
        ticketPrice: 90,
      });

      jest.spyOn(Ticket, "find").mockImplementation(() => ({
        exec: () => Promise.resolve(ticketsFromDb),
      }));

      const visitsByMonth = await TicketController.getVisitsByMonth(
        { query: { method: "js" } },
        { response: (obj) => obj }
      );

      expect(visitsByMonth).toStrictEqual([
        {
          month: "February",
          totalVisits: 3,
        },
        {
          month: "March",
          totalVisits: 3,
        },
      ]);
    });
  });
  describe("Get ticket by id", () => {
    it("should return ticket by id", async () => {
      const h = {
        response: (tickets) => tickets,
      };
      const mockTicket = {
        id: "507f191e810c19729de860ea",
      };
      const findByIdStub = jest
        .spyOn(Ticket, "findById")
        .mockImplementation(() => ({
          exec: () => Promise.resolve(mockTicket),
        }));

      const tickets = await TicketController.getById(
        {
          params: {
            id: "507f191e810c19729de860ea",
          },
        },
        h
      );

      // expect(h.response).toHaveBeenCalledTimes(1)
      // expect(h.response).toBeCalledWith(mockTickets);
      expect(findByIdStub).toBeCalledWith("507f191e810c19729de860ea");
      expect(tickets).toStrictEqual(mockTicket);
    });
  });

  describe("Delete ticket by id", () => {
    it("should delete ticket by id", async () => {
      const h = {
        response: (tickets) => tickets,
      };
      const mockTicket = {
        id: "507f191e810c19729de860ea",
      };
      const findByIdAndDeleteStub = jest
        .spyOn(Ticket, "findByIdAndDelete")
        .mockImplementation(() => ({
          exec: () => Promise.resolve(mockTicket),
        }));

      const tickets = await TicketController.remove(
        {
          params: {
            id: "507f191e810c19729de860ea",
          },
        },
        h
      );

      // expect(h.response).toHaveBeenCalledTimes(1)
      // expect(h.response).toBeCalledWith(mockTickets);
      expect(findByIdAndDeleteStub).toBeCalledWith("507f191e810c19729de860ea");
      expect(tickets).toStrictEqual(mockTicket);
    });
  });

  describe("Update ticket by id", () => {
    it("should update ticket by id", async () => {
      const h = {
        response: (tickets) => tickets,
      };
      const mockUpdatedTicket = {
        id: "507f191e810c19729de860ea",
        customerName: "test",
      };
      const findByIdAndUpdateStub = jest
        .spyOn(Ticket, "findByIdAndUpdate")
        .mockImplementation(() => ({
          exec: () => Promise.resolve(mockUpdatedTicket),
        }));

      const tickets = await TicketController.update(
        {
          params: {
            id: "507f191e810c19729de860ea",
          },
          payload: {
            customerName: "test",
          },
        },
        h
      );

      // expect(h.response).toHaveBeenCalledTimes(1)
      // expect(h.response).toBeCalledWith(mockTickets);
      expect(findByIdAndUpdateStub).toBeCalledWith(
        "507f191e810c19729de860ea",
        {
          customerName: "test",
        },
        {
          new: true,
        }
      );
      expect(tickets).toStrictEqual(mockUpdatedTicket);
    });
  });
});
