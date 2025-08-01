import Icon from "./Icon";
import Button from "./Button";
import Card from "./Card";

export function getCartDifferences(oldCart, newCart) {
    const oldMap = new Map(oldCart.map((item) => [item.id, item]));
    const newMap = new Map(newCart.map((item) => [item.id, item]));

    const added = [];
    const removed = [];
    const changed = [];

    for (const [id, newItem] of newMap.entries()) {
        if (!oldMap.has(id)) {
            added.push(newItem);
        } else {
            const oldItem = oldMap.get(id);
            if (oldItem.quantity !== newItem.quantity) {
                changed.push({
                    ...newItem,
                    oldQuantity: oldItem.quantity,
                    newQuantity: newItem.quantity,
                });
            }
        }
    }

    for (const [id, oldItem] of oldMap.entries()) {
        if (!newMap.has(id)) removed.push(oldItem);
    }

    return { added, removed, changed };
}

function CartChangeSummaryItem({ item, type, oldQuantity, newQuantity }) {
    // type: "add", "remove", "change"
    let indicator;
    if (type === "add") {
        indicator = (
            <span className="inline-flex items-center text-success bg-success/10 rounded-full px-2 py-1 text-sm font-semibold gap-1">
                <Icon name="plus" size={16} />
                Add
            </span>
        );
    } else if (type === "remove") {
        indicator = (
            <span className="inline-flex items-center text-error bg-error/10 rounded-full px-2 py-1 text-sm font-semibold gap-1">
                <Icon name="minus" size={16} />
                Remove
            </span>
        );
    } else if (type === "change") {
        indicator = (
            <span className="inline-flex items-center text-accent bg-accent/10 rounded-full px-2 py-1 text-sm font-semibold gap-1">
                <Icon name="upArrow" size={16} />
                Add More
            </span>
        );
    }

    return (
        <li className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
                <img
                    src={item.image_src}
                    alt={item.name}
                    className="object-cover rounded border border-border-muted bg-bg-tertiary w-14 h-14"
                />
                <div>
                    <span className="block font-medium text-text-primary">{item.name}</span>
                    <span className="block text-sm text-text-muted">${item.price.toFixed(2)}</span>
                    {type === "change" && (
                        <span className="block text-sm text-text-accent mt-0.5">
                            Qty: {oldQuantity} &rarr; {newQuantity}
                        </span>
                    )}
                    {type === "add" && (
                        <span className="block text-sm text-text-accent mt-0.5">
                            Qty: 1
                        </span>
                    )}
                </div>
            </div>
            <div>
                {indicator}
            </div>
        </li>
    );
}

export default function CartChangeConfirmContent({ oldCart = [], newCart = [] }) {
    const changes = getCartDifferences(oldCart, newCart);

    const hasChanges = changes.added.length > 0 || changes.removed.length > 0 || changes.changed.length > 0;

    if (!hasChanges) {
        return null
    }

    return (
        <div className="max-h-64 overflow-y-auto mb-8">
            {changes.added.length > 0 && (
                <section className="mb-4">
                    <h3 className="font-medium text-success mb-2">Add new items:</h3>
                    <ul className="divide-y divide-border-muted">
                        {changes.added.map(item => (
                            <CartChangeSummaryItem key={item.id} item={item} type="add" />
                        ))}
                    </ul>
                </section>
            )}
            {changes.removed.length > 0 && (
                <section className="mb-4">
                    <h3 className="font-medium text-error mb-2">Remove items:</h3>
                    <ul className="divide-y divide-border-muted">
                        {changes.removed.map(item => (
                            <CartChangeSummaryItem key={item.id} item={item} type="remove" />
                        ))}
                    </ul>
                </section>
            )}
            {changes.changed.length > 0 && (
                <section>
                    <h3 className="font-medium text-accent mb-2">Change quantity:</h3>
                    <ul className="divide-y divide-border-muted">
                        {changes.changed.map(item => (
                            <CartChangeSummaryItem
                                key={item.id}
                                item={item}
                                type="change"
                                oldQuantity={item.oldQuantity}
                                newQuantity={item.newQuantity}
                            />
                        ))}
                    </ul>
                </section>
            )}
        </div>
    );
}

export function CartChangesNotification({ open, oldCart, newCart, onConfirm, onCancel }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <Card className="p-8 max-w-md w-full shadow-xl">
                <h2 className="text-xl font-bold mb-4 text-text-primary">Recommendations:</h2>
                <CartChangeConfirmContent oldCart={oldCart} newCart={newCart} />
                <div className="flex justify-end gap-4">
                    <Button variant="warning" onClick={onCancel}>
                        Deny
                    </Button>
                    <Button variant="success" onClick={onConfirm}>
                        Accept
                    </Button>
                </div>
            </Card>
        </div>
    );
}