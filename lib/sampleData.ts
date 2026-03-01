import { Expense, Category } from "@/types";
import { formatDateInput } from "./formatting";

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return formatDateInput(d);
}

let counter = 1;
function mkId() {
  return `sample-${counter++}-${Math.random().toString(36).slice(2, 7)}`;
}

export const SAMPLE_EXPENSES: Expense[] = [
  { id: mkId(), amount: 12.5, category: "Food", description: "Lunch at Chipotle", date: daysAgo(0), createdAt: new Date().toISOString() },
  { id: mkId(), amount: 4.75, category: "Food", description: "Morning coffee", date: daysAgo(0), createdAt: new Date().toISOString() },
  { id: mkId(), amount: 45.0, category: "Transportation", description: "Uber to airport", date: daysAgo(1), createdAt: new Date().toISOString() },
  { id: mkId(), amount: 89.99, category: "Shopping", description: "New running shoes", date: daysAgo(2), createdAt: new Date().toISOString() },
  { id: mkId(), amount: 15.0, category: "Entertainment", description: "Netflix subscription", date: daysAgo(3), createdAt: new Date().toISOString() },
  { id: mkId(), amount: 62.3, category: "Bills", description: "Electric bill", date: daysAgo(4), createdAt: new Date().toISOString() },
  { id: mkId(), amount: 8.99, category: "Food", description: "Grocery store snacks", date: daysAgo(5), createdAt: new Date().toISOString() },
  { id: mkId(), amount: 22.0, category: "Transportation", description: "Gas station fill-up", date: daysAgo(6), createdAt: new Date().toISOString() },
  { id: mkId(), amount: 130.0, category: "Bills", description: "Internet bill", date: daysAgo(7), createdAt: new Date().toISOString() },
  { id: mkId(), amount: 35.5, category: "Entertainment", description: "Movie tickets × 2", date: daysAgo(8), createdAt: new Date().toISOString() },
  { id: mkId(), amount: 55.0, category: "Food", description: "Dinner at Thai place", date: daysAgo(9), createdAt: new Date().toISOString() },
  { id: mkId(), amount: 200.0, category: "Shopping", description: "Amazon order", date: daysAgo(10), createdAt: new Date().toISOString() },
  { id: mkId(), amount: 18.5, category: "Food", description: "Sushi takeout", date: daysAgo(11), createdAt: new Date().toISOString() },
  { id: mkId(), amount: 3.5, category: "Transportation", description: "Bus pass top-up", date: daysAgo(12), createdAt: new Date().toISOString() },
  { id: mkId(), amount: 9.99, category: "Entertainment", description: "Spotify subscription", date: daysAgo(13), createdAt: new Date().toISOString() },
  { id: mkId(), amount: 47.0, category: "Food", description: "Weekly groceries", date: daysAgo(14), createdAt: new Date().toISOString() },
  { id: mkId(), amount: 25.0, category: "Other", description: "Birthday card + gift wrap", date: daysAgo(15), createdAt: new Date().toISOString() },
  { id: mkId(), amount: 110.0, category: "Bills", description: "Phone bill", date: daysAgo(16), createdAt: new Date().toISOString() },
  { id: mkId(), amount: 14.99, category: "Entertainment", description: "Video game DLC", date: daysAgo(17), createdAt: new Date().toISOString() },
  { id: mkId(), amount: 6.5, category: "Food", description: "Iced latte", date: daysAgo(18), createdAt: new Date().toISOString() },
  { id: mkId(), amount: 75.0, category: "Shopping", description: "Clothing sale haul", date: daysAgo(19), createdAt: new Date().toISOString() },
  { id: mkId(), amount: 30.0, category: "Transportation", description: "Parking for the week", date: daysAgo(20), createdAt: new Date().toISOString() },
  { id: mkId(), amount: 52.0, category: "Food", description: "BBQ with friends (share)", date: daysAgo(21), createdAt: new Date().toISOString() },
  { id: mkId(), amount: 19.99, category: "Entertainment", description: "eBook purchase", date: daysAgo(22), createdAt: new Date().toISOString() },
  { id: mkId(), amount: 85.0, category: "Bills", description: "Water & sewage", date: daysAgo(23), createdAt: new Date().toISOString() },
];
