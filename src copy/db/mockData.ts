export const MOCK_BORROWERS = [
  {
    id: 1,
    name: "Eric Kegoya",
    phone: "0712345678",
    totalBorrowed: 1200,
    status: "NOT PAID",
  },
  {
    id: 2,
    name: "Sarah Wanjiku",
    phone: "0787654321",
    totalBorrowed: 5000,
    status: "PAID",
  },
  {
    id: 3,
    name: "John Doe",
    phone: "0700112233",
    totalBorrowed: 2500,
    status: "PARTIAL",
  },
];

export const MOCK_LOANS = [
  {
    id: 1,
    borrowerId: 1,
    amount: 1000,
    interest: 200,
    dueDate: "2026-04-22",
    status: "Active",
  },
];
