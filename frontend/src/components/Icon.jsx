import CartIcon from '../assets/cart.svg?react';
import LockIcon from '../assets/lock.svg?react';
import CloseIcon from '../assets/close.svg?react';
import SearchIcon from '../assets/search.svg?react';
import PlusIcon from '../assets/plus.svg?react';
import CheckIcon from '../assets/check.svg?react';
import MenuIcon from '../assets/menu.svg?react';
import ErrorIcon from '../assets/error.svg?react';
import UpArrowIcon from '../assets/arrow-up.svg?react';
import MinusIcon from '../assets/minus.svg?react';


const icons = {
    cart: CartIcon,
    lock: LockIcon,
    close: CloseIcon,
    search: SearchIcon,
    plus: PlusIcon,
    check: CheckIcon,
    mobile: MenuIcon,
    error: ErrorIcon,
    upArrow: UpArrowIcon,
    minus: MinusIcon
};

export default function Icon({ name, size = 24, className = "", ...props }) {
    const SvgIcon = icons[name];
    if (!SvgIcon) return null;
    return (
        <SvgIcon
            width={size}
            height={size}
            className={className}
            {...props}
        />
    );
}