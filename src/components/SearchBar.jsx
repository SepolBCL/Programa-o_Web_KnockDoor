import BotaoAcao from './BotaoAcao';
import '../styles/Resource.css';

const SearchBar = ({ placeholder, value, onChange, onFilter }) => (
  <div className="search-bar">
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
    <BotaoAcao texto="Filtro" onClick={onFilter} classe="filter-toggle-btn" />
  </div>
);

export default SearchBar;
