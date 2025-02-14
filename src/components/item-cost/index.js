import { useMemo, useState, useEffect } from 'react';
import Tippy from '@tippyjs/react';
import { useDispatch } from 'react-redux';
import { followCursor } from 'tippy.js';
import 'tippy.js/dist/tippy.css'; // optional
import { useTranslation } from 'react-i18next';
import Icon from '@mdi/react';
import { mdiTimerSand, mdiCloseBox, mdiCheckboxMarked } from '@mdi/js';

import BarterToolip from '../barter-tooltip';
import formatPrice from '../../modules/format-price';

import { setItemCost as setCraftItemCost } from '../../features/crafts/craftsSlice';
import { setItemCost as setBarterItemCost } from '../../features/barters/bartersSlice';

import './index.css';

const ConditionalWrapper = ({ condition, wrapper, children }) => {
    return condition ? wrapper(children) : children;
};

function ItemCost({
    itemId,
    count,
    price,
    vendor = {name: 'Flea Market', normalizedName: 'flea-market'},
    priceType = 'cash',
    priceDetails,
    isTool,
}) {
    const dispatch = useDispatch();
    const { t } = useTranslation();

    const [customPrice, setCustomPrice] = useState(price);
    const [editingCustomPrice, setEditingCustomPrice] = useState(false);

    useEffect(() => {
        setCustomPrice(price);
    }, [price, setCustomPrice]);

    let { displayPrice, tooltip, displayImage} = useMemo(() => {
        let displayPrice = '';
        let tooltip = false;
        let displayImage = (
            <img
                alt={vendor.name}
                className="barter-icon"
                src={`${process.env.PUBLIC_URL}/images/traders/${vendor.normalizedName}-icon.jpg`}
                loading="lazy"
            />
        );
        if (priceType === 'cached') {
            displayPrice = count;
            displayImage =  (
                <Icon
                    path={mdiTimerSand}
                    size={0.5}
                    className="icon-with-text"
                />
            );
            tooltip = t('Flea market prices loading');
        } else if (isTool) {
            displayPrice = `${count} x ${formatPrice(price)} = ${formatPrice(count * price)}`
        } else {
            displayPrice = (
                <span>
                    <span>{count} x </span>
                    <span 
                        className={`no-click${editingCustomPrice ? ' hidden' : ''}`}
                        onClick={(event) => {
                            setEditingCustomPrice(true);
                        }}
                    >
                        {formatPrice(price)}{priceType === 'custom' ? '*' : ''}
                    </span>
                    <span
                        className={`no-click${editingCustomPrice ? '' : ' hidden'}`}
                    >
                        <input 
                            className="no-click custom-price" 
                            value={customPrice}
                            inputMode="numeric"
                            onChange={(e) => {
                                let sanitized = e.target.value.replaceAll(/[^0-9]/g, '');
                                if (sanitized) {
                                    sanitized = parseInt(sanitized);
                                }
                                setCustomPrice(sanitized);
                            }}
                        />
                        <span> ₽</span>
                        <Icon
                            path={mdiCheckboxMarked}
                            size={1}
                            className="icon-with-text no-click muted-green"
                            onClick={(event) => {
                                dispatch(
                                    setBarterItemCost({
                                        itemId: itemId,
                                        price: customPrice
                                    }),
                                );
                                dispatch(
                                    setCraftItemCost({
                                        itemId: itemId,
                                        price: customPrice
                                    }),
                                );
                                setEditingCustomPrice(false);
                            }}
                        />
                        <Icon
                            path={mdiCloseBox}
                            size={1}
                            className="icon-with-text no-click muted-red"
                            onClick={(event) => {
                                dispatch(
                                    setBarterItemCost({
                                        itemId: itemId,
                                        price: false
                                    }),
                                );
                                dispatch(
                                    setCraftItemCost({
                                        itemId: itemId,
                                        price: false
                                    }),
                                );
                                setEditingCustomPrice(false);
                            }}
                        />
                    </span>
                    <span>{` = ${formatPrice(count * price)}`}</span>
                </span>
            );
        }
        return {displayPrice: displayPrice, tooltip: tooltip, displayImage: displayImage};
    }, [dispatch, t, vendor, priceType, itemId, count, price, isTool, customPrice, setCustomPrice, editingCustomPrice, setEditingCustomPrice]);

    if (priceType === 'barter') {
        displayImage = (
            <img
                alt={t('Barter')}
                className="barter-icon"
                loading="lazy"
                src={`${process.env.PUBLIC_URL}/images/icon-barter.png`}
            />
        );
        tooltip = (
            <BarterToolip
                source={vendor.name}
                requiredItems={priceDetails.requiredItems}
            />
        );
    }

    return (
        <ConditionalWrapper
            condition={tooltip}
            wrapper={(children) => {
                return (
                    <Tippy 
                        placement="bottom"
                        followCursor={'horizontal'}
                        // showOnCreate = {true}
                        interactive={true}
                        content={tooltip}
                        plugins={[followCursor]}
                    >
                        {children}
                    </Tippy>
                );
            }}
        >
            <div>
                {displayImage}
                {displayPrice}
            </div>
        </ConditionalWrapper>
    );
}

export default ItemCost;
