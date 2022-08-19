module.exports = {
    general: {
        invalidData: {
            error: 'invalid_data',
            message: 'Os dados enviados são inválidos.'
        },
        failedToSendEmail({message = 'Falha ao enviar o email.'}) {
            return {
                error: 'failed_to_send_email',
                message
            }
        }
    },
    auth: {
        loginRequired: {
            error: 'login_required',
            message: 'Entre com sua conta para continuar.'
        },
        invalidCredentials: {
            error: 'invalid_credentials',
            message: 'Os dados informados não são válidos.'
        },
        minAgeRequired: {
            error: 'min_age_required',
            message: 'Você deve ter pelo menos 15 anos para criar uma conta.'
        },
        emailAlreadyInUse: {
            error: 'email_already_in_use',
            message: 'Este email já está em uso.'
        },
        cpfAlreadyInUse: {
            error: 'cpf_already_in_use',
            message: 'Este CPF já está em uso.'
        },
        emailAlreadyVerified: {
            error: 'email_already_verified',
            message: 'Seu Email já está verificado.'
        },
        emailCpfOrPasswordInvalid: {
            error: 'email_cpf_password_invalid',
            message: 'Email, CPF ou senha inválidos.'
        },
        tokenNotProvided: {
            error: 'token_not_provided',
            message: 'O token não foi informado'
        }
    },
    product: {
        notFound: {
            error: 'product_not_found',
            message: 'O produto não foi encontrado'
        },
        productIdRequired: {
            error: 'product_id_required',
            message: 'O ID do produto não foi informado.'
        },
        variant: {
            notFound: {
                error: 'product_variant_not_found',
                message: 'A variante selecionada não foi encontrada.'
            },
            insuficientStock: {
                error: 'product_variant_stock_insuficient',
                message: 'Não há estoque suficiente para a quantidade desejada.'
            }
        },
        shipping: {
            notFound: {
                error: 'product_shipping_not_found',
                message: 'O método de envio selecionado não existe ou não está mais disponível.'
            },
        }
    },
    ticket: {
        ticketNotElegible: (name) => ({
            error: 'ticket_not_elegible',
            message: `Você não é elegível para utilizar o cupom ${name}.`
        }),
        ticketNotExist: (name) => ({
            error: 'ticket_not_exist',
            message: `O cupom ${name} não existe.`
        }),
        ticketIdNotProvided: {
            error: 'ticket_id_not_provided',
            message: 'O ID do cupom não foi informado.'
        },
        ticketCantBeAppliedOnThisProduct: (name) => ({
            error: 'ticket_cant_be_applied_on_this_product',
            message: `O cupom ${name} não pode ser aplicado neste produto.`
        }),
        ticketCantBeAppliedOnCart: (name) => ({
            error: 'ticket_cant_be_applied_on_cart',
            message: `O cupom ${name} não pode ser aplicado no carrinho.`
        })
    },
    cart: {
        repeated: {
            error: 'repeated_item_cart',
            message: 'Esta variante deste produto já está em seu carrinho, escolha outra variante para adicionar 😉.'
        },
        empty: {
            error: 'empty_cart',
            message: 'Seu carrinho está vazio.'
        }
    },
    zipcode: {
        invalidZipcode: {
            error: 'invalid_zip_code',
            message: 'O CEP informado não é válido.'
        }
    },
    shipping: {
        notFound: {
            error: 'shipping_method_not_found',
            message: 'Não foi possível identificar o método de envio.'
        }
    },
    payment: {
        notAuthorized: {
            error: 'payment_not_authorized',
            message: 'Verifique os dados e tente novamente.'
        }
    },
    creditCard: {
        notFound: {
            error: 'credit_card_not_found',
            message: 'Cartão de crédito não encontrado.'
        },
        invalidValue: {
            error: 'invalid_charge_value',
            message: 'Valor inválido.'
        }
    },
    address: {
        notFound: {
            error: 'address_not_found',
            message: 'Endereço não encontrado.'
        }
    },
    invalidRequest: {
        error: 'invalid_request',
        message: 'Não foi possível interpretar a requisição.'
    },
    internalServerError: {
        error: 'internal_server_error',
        message: 'Erro interno do servidor'
    }
}