// Transaction 関連
export interface Transaction {
  id: number;
  date: string; // YYYY-MM-DD
  amount: number;
  type: "income" | "expense";
  category: string;
  icon: string; // 絵文字
  memo?: string;
}

export interface TransactionInput {
  date: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  memo?: string;
}

// Summary 関連
export interface Summary {
  month: string; // YYYY-MM
  income: number;
  expense: number;
  balance: number;
}

// Category 関連
export interface Category {
  id: number;
  name: string;
  icon: string;
  is_default: boolean;
}

export interface CategoryInput {
  name: string;
  icon: string;
}

// ChartData 関連
export interface ChartData {
  month: string; // YYYY-MM
  income: number;
  expense: number;
}

// API レスポンスエラー
export interface ApiError {
  error: string;
}
