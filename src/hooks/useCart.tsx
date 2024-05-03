import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';
const LOCAL_STORAGE_KEY = '@RocketShoes:cart'

interface CartProviderProps {
  children: ReactNode;
}

interface ProductsMethodsProps {
  add: (productId: number) => void
  remove: (productId: number) => void
  decrement: (productId: number) => void
}

interface CartContextData {
  cart: Product[];
  products: Product[],
  stock: Stock[],
  ProductsMethods: ProductsMethodsProps
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [products, setProducts] = useState<Product[]>([])
  const [stock, setStock] = useState<Stock[]>([])

  useEffect(() => {
    api.get('/products')
      .then(response => setProducts(response.data))

    api.get('/stock')
      .then(response => setStock(response.data))
  }, [])

  const LocalStorageMethods = {
    get: () => {
      const rocketShoes_localStorage = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (rocketShoes_localStorage) {
        return JSON.parse(rocketShoes_localStorage)
      }
    },
    att: () => {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cart))
    }
  }

  const [cart, setCart] = useState<Product[]>(() => {
    const rocketShoes_localStorage = LocalStorageMethods.get()

    return rocketShoes_localStorage;
  });

  useEffect(() => {
    LocalStorageMethods.att()
  }, [cart])

  const ProductsMethods = {
    get: (productId: number) => {
      const updatedCart = [...cart]
      const existingProduct = updatedCart.find(product => product.id === productId)
      return { existingProduct, updatedCart }
    },

    add: (productId: number) => {
      try {
        const { existingProduct, updatedCart } = ProductsMethods.get(productId)

        if (existingProduct) {
          const stockAmount = stock.find(product => product.id === productId)
          if (stockAmount && existingProduct.amount >= stockAmount.amount) {
            throw new Error(`Não temos mais o produto ${existingProduct.id} no estoque.`)
          }
          existingProduct.amount += 1
        }
        else {
          const productToAdd = products.find(product => product.id === productId)
          if (productToAdd) {
            updatedCart.push({ ...productToAdd, amount: 1 })
          } else {
            throw new Error(`Produto com o id ${productId} não encontrado`)
          }
        }
        setCart(updatedCart)
      } catch (Error) {
        console.log(Error)
        toast.error(`${Error}`)
      }
    },

    remove: (productId: number) => {
      try {
        setCart(prevState => prevState.filter(product => product.id !== productId))
      } catch (Error) {
        console.log(Error)
      }
    },

    decrement: (productId: number) => {
      try {
        const { existingProduct, updatedCart } = ProductsMethods.get(productId)

        if (existingProduct) {
          existingProduct.amount -= 1
        }
        setCart(updatedCart)
        LocalStorageMethods.att()
      } catch (error) {
        console.log(error)
        toast.error(`${Error}`)
      }
    }
  }

  return (
    <CartContext.Provider value={{
      cart,
      products,
      stock,
      ProductsMethods
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
