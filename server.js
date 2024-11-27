import express from 'express';

const app = express();
const port = 8000;

app.use(express.json());

let transactions = [];

// Helper function to calculate current balance
const calculateBalance = () => {
  const balance = {};
  
  // Calculate balance for each payer
  transactions.forEach(transaction => {
    balance[transaction.payer] = (balance[transaction.payer] || 0) + transaction.points;
  });
  
  return balance;
};

// Add points endpoint
app.post('/add', (req, res) => {
  // Validate request body
  const { payer, points, timestamp } = req.body;
  if (!payer || points === undefined || !timestamp) {
    return res.status(400).send('Missing required fields');
  }
  
  // Add transaction to transactions arrays
  transactions.push({ payer, points, timestamp });
  res.status(200).send();
});

// Spend points endpoint
app.post('/spend', (req, res) => {
  const { points: pointsToSpend } = req.body;
  
  // Validate points to spend
  if (pointsToSpend === undefined) {
    return res.status(400).send('Points to spend not specified');
  }
  
  // Calculate total available points
  const currentBalance = calculateBalance();
  const totalPoints = Object.values(currentBalance).reduce((sum, points) => sum + points, 0);
  
  if (pointsToSpend > totalPoints) {
    return res.status(400).send('Not enough points available');
  }
  
  // Sort transactions by timestamp
  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(a.timestamp) - new Date(b.timestamp)
  );
  
  let remainingPointsToSpend = pointsToSpend;
  
  // Iterate through transactions to spend points
  for (const transaction of sortedTransactions) {
    // Skip transactions that have already been spent
    if (remainingPointsToSpend <= 0) break;
    
    if (currentBalance[transaction.payer] <= 0) continue;

    // Spend points
    const timestamp = Date.now();
    const removedPoints = Math.min(transaction.points, remainingPointsToSpend);
    const newTransactionToAdd = { payer: transaction.payer, points: -1 * removedPoints, timestamp: timestamp };
    transactions.push(newTransactionToAdd);
    remainingPointsToSpend -= removedPoints;
  }
  
  // Return points spent
  const response = calculateBalance();
  res.status(200).json(response);
});

// Get balance endpoint
app.get('/balance', (req, res) => {
  const balance = calculateBalance();
  res.status(200).json(balance);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});