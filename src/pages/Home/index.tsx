import { MdAddShoppingCart } from 'react-icons/md';
import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../util/format';
import { ProductList } from './styles';

const Home = (): JSX.Element => {
  const { ProductsMethods, cart, products } = useCart();

  const cartItemAmount = (id: number) => {
    const hasInCart = cart.find(product => product.id === id)
    if (hasInCart) {
      return hasInCart.amount
    } else {
      return 0
    }
  }

  return (
    <ProductList>
      {products.map(product => (
        <li key={product.id}>
          <img src={product.image} alt={product.title} />
          <strong>{product.title}</strong>
          <span>{formatPrice(product.price)}</span>
          <button
            type="button"
            data-testid="add-product-button"
            onClick={() => ProductsMethods.add(product.id)}
          >
            <div data-testid="cart-product-quantity">
              <MdAddShoppingCart size={16} color="#FFF" />
              {cartItemAmount(product.id)}
            </div>

            <span>ADICIONAR AO CARRINHO</span>
          </button>
        </li>
      ))}
    </ProductList>
  );
};

export default Home;
