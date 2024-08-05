const querys = {
    sales: {
        insert: {
            name: "sales-insert",
            text: "INSERT INTO sales VALUES ($1, $2, $3, $4, $5)",
        },
        insertMany: {
            name: "sales-insert-many",
            text: "INSERT INTO sales VALUES ",
        },
        getValueByProdAndSeller: {
            name: "sales-totalizer",
            text: "SELECT seller, product, transaction_type, SUM(value) AS amount FROM sales GROUP BY seller, product, transaction_type order by seller, product"
        }
    },

    feriado: {
        selectFeriado: "SELECT * FROM feriado WHERE codigo_ibge=$1 AND data=$2", 
        selectFeriadoNacional: "SELECT * FROM feriado_nacional WHERE data=$1",
        selectFeriadoFeriadoNacional: "SELECT * FROM feriado f "
            + "INNER JOIN feriado_nacional fn ON fn.data = f.data "
            + "WHERE codigo_ibge=$1 AND f.data=$2",
        updateFeriado: "UPDATE feriado SET name = $3 WHERE codigo_ibge=$1 AND data=$2",
        insertFeriado: "INSERT INTO feriado VALUES ($1, $2, $3)",
        deleteFeriado: "DELETE FROM feriado WHERE codigo_ibge=$1 AND data=$2",
        
    },
    cidade: {
        selectCidade: "SELECT * FROM cidade WHERE codigo_ibge=$1"
    }
}

export default querys