const querys = {
    WLStore: {
        order: {
            insert: {
                name: "order-insert",
                text: `
                    INSERT INTO public.order(
                        customer_id, status, updated_at, currency
                    ) VALUES ($1, $2, $3, $4) RETURNING *
                `,
            },
            select: `
                SELECT * FROM public.order o
                INNER JOIN public.order_items oi ON oi.order_id = o.id
                INNER JOIN public.catalog c ON c.id = oi.item_id
                WHERE o.id=$1
            `,
            update: {
                name: 'order-update',
                text: `
                    UPDATE public.order 
                    SET status = $1,
                        updated_at = $2,
                        paid_at = $3
                    WHERE id = $4
                `
            },
            updateTimestamp: {
                name: 'order-update',
                text: `
                    UPDATE public.order 
                    SET update = $1
                    WHERE payment_id = $2
                `
            }
        },
        orderItems: {
            insert: {
                name: "order-items-insert",
                text: `
                    INSERT INTO public.order_items(order_id, item_id, quantity) 
                    SELECT $1::bigint, item_id_arr, quantity_arr
                    FROM unnest($2::int[], $3::float[]) AS t(item_id_arr, quantity_arr)
                `
            }
        },
        payment: {
            select: {
                name: "select-payment",
                text: `
                    SELECT *, p.id as id, pm.id as payment_method_id 
                    FROM public.payment p
                    INNER JOIN public.payment_method pm ON pm.payment_id = p.id
                    WHERE p.order_id=$1
                `
            },
            insert: {
                name: "payment-insert",
                text: `
                    INSERT INTO public.payment(
                        order_id, 
                        transaction_id,
                        total_amount,
                        total_paid_amount,
                        status,
                        status_detail,
                        currency,
                        created_date,
                        last_updated_date,
                        idempotency_key
                    ) 
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
                    RETURNING id
                `
            }
        },
        paymentStatus: {
            insert: {
                name: "payment-status-insert",
                text: `
                    INSERT INTO public.payment_status(
                        created_at,
                        status,
                        status_detail,
                        payment_id
                    ) 
                    VALUES ($1, $2, $3, $4) 
                    RETURNING id
                `
            }
        },
        paymentMethod: {
            insert: {
                name: "payment-method-insert",
                text: `
                    INSERT INTO public.payment_method(
                        transaction_id,
                        amount,
                        paid_amount,
                        reference_id,
                        status,
                        status_detail,
                        payment_method_id,
                        type,
                        installments,
                        installment_amount,
                        payment_id
                    ) 
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
                    RETURNING id
                `
            }
        },
        paymentMethodStatus: {
            insert: {
                name: "payment-method-status-insert",
                text: `
                    INSERT INTO public.payment_method_status(
                        created_at,
                        status,
                        status_detail,
                        payment_method_id,
                        payment_id
                    ) 
                    VALUES ($1, $2, $3, $4, $5) 
                    RETURNING id
                `
            }
        },
        catalog: {
            select: {
                name: "catalog-select",
                text: `
                    SELECT * FROM public.catalog 
                    WHERE id = ANY($1)
                `
            }
        }
    },
    user: {
        insert: "INSERT INTO public.user VALUES (DEFAULT, $1, $2) RETURNING id",
        update: "UPDATE public.user SET name = $1, email = $2 WHERE id = $3",
        updatePatch: "UPDATE public.user SET {fields} WHERE id = ${id}",
        select: "SELECT * FROM public.user",
        selectByEmail: "SELECT * FROM public.user WHERE email = $1",
        selectById: "SELECT * FROM public.user WHERE id = $1",
        delete: "DELETE FROM public.user WHERE id = $1"
        //é necessário expecificar public.user para o postgres diferenciar da tabela user do sistema interno dele
    },
    auth: {
        insert: "INSERT INTO auth VALUES (DEFAULT, $1, $2)",
        select: "SELECT * FROM auth",
        selectByUserId: "SELECT * FROM auth a WHERE a.user = $1",
        delete: "DELETE FROM auth WHERE auth.user = $1"
    },
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