export default function ObjectViewTable({ data, columns }) {
    if (!data || !Array.isArray(data) || data.length === 0) {
        return (
            <div className="bg-bg-tertiary text-text-muted py-8 px-4 text-center shadow">
                No data available
            </div>
        );
    }

    return (
        <div className="overflow-x-auto shadow bg-bg-primary">
            <table className="min-w-full divide-y divide-bg-tertiary">
                <thead>
                    <tr>
                        {columns.map((col, index) => (
                            <th
                                key={index}
                                className="px-4 py-3 text-left text-sm font-semibold text-text-primary bg-bg-tertiary"
                            >
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map(obj => (
                        <tr
                            key={obj.id || JSON.stringify(obj)}
                            className="hover:bg-bg-tertiary transition-colors"
                        >
                            {columns.map(col => (
                                <td
                                    key={col.key}
                                    className="px-4 py-3 text-sm text-text-primary border-b border-bg-tertiary"
                                >
                                    {col.render
                                        ? col.render(obj[col.key], obj)
                                        : obj[col.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}