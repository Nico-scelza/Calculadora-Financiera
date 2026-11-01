def regimen_compuesto():
    print("Elija la operación que desea calcular: ")
    print("Monto Final = M")
    print("Interés Total = I")
    print("Capital Invertido = C")
    print("Tasa de Interés = Y")
    print("Valor Descontado = VD")
    print("Valor Actual = VA")
    print("Descuento Total = D")
    print("Resultado Financiero = RF")
    while True:
        pregunta = input("Inserte la opción elegida: ").lower()
        if pregunta == "i":
            break
        elif pregunta == "m":
            break
        elif pregunta == "c":
            break
        elif pregunta == "y":
            break
        elif pregunta == "vd":
            break
        elif pregunta == "va":
            break
        elif pregunta == "d":
            break
        elif pregunta == "rf":
            break
        else:
            print("Por favor, inserte una respuesta válida")
    if pregunta == "i":
        while True:
            try:    
                C = float(input("Inserte el capital invertido: "))
                M = float(input("Inserte el monto recibido: "))
                break
            except:
                print("Por favor, inserte un dato válido")
        Interés_total = M - C
        return Interés_total
    elif pregunta == "c":
        while True:
            try:
                M = float(input("Inserte el monto recibido al final de la operación: "))
                i1 = float(input("Inserte el porcentaje de interés: "))
                i = i1/100
                n = float(input("Inserte la cantidad de períodos: "))
                break
            except:
                print("Por favor, inserte un dato válido")
        Capital = M / ((1 + i) ** n)
        return Capital
    elif pregunta == "y":
        while True:
            try:
                M = float(input("Inserte el monto recibido al final de la operación: "))
                C = float(input("Inserte el capital invertido: "))
                n = float(input("Inserte la cantidad de períodos: "))
                break
            except:
                print("Por favor, inserte un dato válido")
        interés = (((M / C) ** (1 / n)) - 1) * 100
        return interés
    elif pregunta == "m":
        while True:
            try:    
                C = float(input("Inserte el capital invertido: "))
                break
            except:
                print("Por favor, inserte un dato válido")
        while True:            
            cambio_tasa = input("¿Hay un cambio de tasa en el medio?: ").lower()
            if cambio_tasa == "si":
                break
            elif cambio_tasa == "no":
                break
            else:
                print("Por favor, responda con 'si' o con 'no'")
        if cambio_tasa == "si":
            tasas = []
            periodos = []
            while True:
                try:
                    cantidad = int(input("¿Cuántas tasas hay?: "))
                    break
                except:
                    print("Por favor, inserte un dato válido")
            for i in range(cantidad):
                while True:
                    try:
                        tasa1 = float(input(f"Inserte la tasa {i+1}: "))
                        break
                    except:
                        print("Por favor, inserte un dato válido")
                tasa = tasa1 / 100
                tasas.append(tasa)
            for i in range(cantidad):
                while True:
                    try:
                        n = float(input(f"Inserte la cantidad de períodos para la tasa {i+1}: "))
                        periodos.append(n)
                        break
                    except:
                        print("Por favor, inserte un dato válido")
            monto = C
            for tasa, n in zip(tasas, periodos):
                monto *= (1 + tasa) ** n
            return monto
        else:
            while True:
                try:
                    i1 = float(input("Inserte el porcentaje de interés: "))
                    i = i1/100
                    n = float(input("Inserte la cantidad de períodos: "))
                    break
                except:
                    print("Por favor, inserte un dato válido")
            monto = C * (1 + i) ** n
            return monto
    elif pregunta == "vd":
        while True:
            try:
                N = float(input("Inserte el valor nominal: "))
                d1 = float(input("Inserte la tasa de descuento: "))
                d = d1 / 100
                n = float(input("Inserte la cantidad de períodos: "))
                break
            except:
                print("Por favor, inserte un dato válido")
        valor_descontado = N * (1 - d) ** n
        return valor_descontado
    elif pregunta == "va":
        while True:
            try:
                N = float(input("Inserte el valor nominal: "))
                i1 = float(input("Inserte la tasa de interés: "))
                i = i1 / 100
                n = float(input("Inserte la cantidad de períodos: "))
                break
            except:
                print("Por favor, inserte un dato válido")
        valor_actual = N / (1 + i) ** n
        return valor_actual
    elif pregunta == "d":
        while True:
            try:
                N = float(input("Inserte el valor nominal: "))
                d1 = float(input("Inserte la tasa de descuento: "))
                d = d1 / 100
                n = float(input("Inserte la cantidad de períodos: "))
                break
            except:
                print("Por favor, inserte un dato válido")
        descuento = N * (1 - (1 - d) ** n)
        return descuento
    elif pregunta == "rf":
        while True:
            try:
                VD = float(input("Inserte el valor descontado de la operación: "))
                Vi = float(input("Inserte el valor original de la operación: "))
                break
            except:
                print("Por favor, inserte un dato válido")
        RF = VD - Vi
        return RF
    else:
        print("Por favor, inserte una opción válida")