def rentas_valor_actual():
    print("Elija la operación que desea calcular: ")
    print("1. Cálculo del valor actual de una renta de pagos vencido, a una tasa determinada, en base al valor final")
    print("2. Saldo de deuda")
    while True:
        try:
            pregunta = int(input("Inserte la opción elegida: "))
            if pregunta == 1:
                break
            elif pregunta == 2:
                break
            else:
                print("Por favor, inserte una opción válida")
        except:
            print("Por favor, inserte una opción válida")
    if pregunta == 1:
        while True:
            try:
                C = float(input("Inserte el valor de las cuotas: "))
                break
            except:
                print("Por favor, inserte una opción válida")
        while True:
            try:
                i1 = float(input("Inserte la tasa de interés: "))
                i = i1 / 100
                break
            except:
                print("Por favor, inserte una opción válida")
        while True:
            try:
                n = float(input("Inserte la cantidad total de cuotas: "))
                break
            except:
                print("Por favor, inserte una opción válida")
        VA = C * ((1 - (1 + i)**(-n)) / i)
        return VA
    elif pregunta == 2:
        while True:
            try:
                C = float(input("Inserte el valor de las cuotas: "))
                break
            except:
                print("Por favor, inserte una opción válida")
        while True:
            try:
                i1 = float(input("Inserte la tasa de interés: "))
                i = i1 / 100
                break
            except:
                print("Por favor, inserte una opción válida")
        while True:
            try:
                n = float(input("Inserte la cantidad total de cuotas: "))
                break
            except:
                print("Por favor, inserte una opción válida")
        while True:
            try:
                h = float(input("Inserte la cantidad de cuotas pagadas: "))
                if h <= n:
                    break
                else:
                    print(f"Inserte un número menor a {n}")
            except:
                print("Por favor, inserte una opción válida")
        SD = (C / i) * (1 - (1 + i) ** (-(n - h)))
        return SD
    else:
        print("Por favor, inserte una opción válida")