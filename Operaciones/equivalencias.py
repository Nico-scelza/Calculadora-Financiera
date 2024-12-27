def equivalencias ():
    print("Puede realizar una de estas operaciones:")
    print("1. Tasa efectiva vencida a tasa efectiva vencida")
    print("2. Tasa nominal vencida a tasa efectiva vencida")
    print("3. Tasa efectiva vencida a tasa nominal vencida")
    print("4. Tasa nominal vencida a tasa nominal vencida")
    print("5. Tasa efectiva adelantada a tasa efectiva adelantada")
    print("6. Tasa efectiva adelantada a tasa nominal adelantada")
    print("7. Tasa nominal adelantada a tasa efectiva adelantada")
    print("8. Tasa nominal adelantada a tasa nominal adelantada")
    print("9. Tasa efectiva vencida a tasa efectiva adelantada")
    print("10. Tasa efectiva adelantada a tasa efectiva vencida")
    print("11. Tasa nominal vencida a tasa nominal adelantada")
    print("12. Tasa nominal adelantada a tasa nominal vencida")
    while True:
        eleccion = int(input("Elija la operación: "))
        if 1 <= eleccion <= 12:
            break
        else:
            print("Inserte una opción válida")
    if eleccion == 1:
        while True:
            try:
                efectiva = float(input("Inserte la tasa a convertir (en porcentaje): "))
                i2 = efectiva / 100
                break
            except:
                print("Inserte un dato válido")
        while True:
            try:
                ut2 = int(input("Inserte la unidad de tiempo de la tasa a convertir: "))
                break
            except:
                print("Inserte un dato válido")
        while True:
            try:
                ut1 = int(input("Inserte la unidad de tiempo de la tasa resultante: "))
                break
            except:
                print("Inserte un dato válido")
        i = ((1 + i2)**(ut1 / ut2)) - 1
        return i
    elif eleccion == 2:
        while True:
            try:
                nominal = float(input("Inserte la tasa nominal (en porcentaje): "))
                jm = nominal / 100
                break
            except:
                print("Inserte un dato válido")
        while True:
            try:
                ut2 = int(input("Inserte la unidad de tiempo de la tasa nominal: "))
                break
            except:
                print("Inserte un dato válido")
        while True:
            try:
                fs = int(input("Inserte la frecuencia de subcapitalización de la tasa nominal: "))
                break
            except:
                print("Inserte un dato válido")
        while True:
            try:
                ut1 = int(input("Inserte la unidad de tiempo de la tasa efectiva: "))
                break
            except:
                print("Inserte un dato válido")
        i = (1 + (jm / ut2) * fs) ** (ut1 / fs) - 1
        return i
    elif eleccion == 3:
        while True:
            try:
                efectiva = float(input("Inserte la tasa efectiva (en porcentaje): "))
                i = efectiva / 100
                break
            except:
                print("Inserte un dato válido")
        while True:
            try:
                ut1 = int(input("Inserte la unidad de tiempo de la tasa efectiva: "))
                break
            except:
                print("Inserte un dato válido")
        while True:
            try:
                ut2 = int(input("Inserte la unidad de tiempo de la tasa nominal: "))
                break
            except:
                print("Inserte un dato válido")
        while True:
            try:
                fs = int(input("Inserte la frecuencia de subcapitalización de la tasa nominal: "))
                break
            except:
                print("Inserte un dato válido")
        jm = ((1 + i) ** (fs / ut1) - 1) * (ut2 / fs)
        return jm
    elif eleccion == 4:
        while True:
            try:
                nominal = float(input("Inserte la tasa nominal a convertir (en porcentaje): "))
                jm2 = nominal / 100
                break
            except:
                print("Inserte un dato válido")
        while True:
            try:
                ut2 = int(input("Inserte la unidad de tiempo de la tasa nominal a convertir: "))
                break
            except:
                print("Inserte un dato válido")
        while True:
            try:
                fs2 = int(input("Inserte la frecuencia de subcapitalización de la tasa nominal a convertir: "))
                break
            except:
                print("Inserte un dato válido")
        while True:
            try:
                ut1 = int(input("Inserte la unidad de tiempo de la tasa nominal resultante: "))
                break
            except:
                print("Inserte un dato válido")
        while True:
            try:
                fs1 = int(input("Inserte la frecuencia de subcapitalización de la tasa nominal resultante: "))
                break
            except:
                print("Inserte un dato válido")
        jm = ((1 + (jm2 / ut2) * fs2) ** (fs1 / fs2)-1) * (ut1 / fs1)
        return jm
    elif eleccion == 5:
        while True:
            try:
                efectiva = float(input("Inserte la tasa a convertir (en porcentaje): "))
                i2 = efectiva / 100
                break
            except:
                print("Inserte un dato válido")
        while True:
            try:
                ut2 = int(input("Inserte la unidad de tiempo de la tasa a convertir: "))
                break
            except:
                print("Inserte un dato válido")
        while True:
            try:
                ut1 = int(input("Inserte la unidad de tiempo de la tasa resultante: "))
                break
            except:
                print("Inserte un dato válido")
        i = 1 - (1 - i2) ** (ut1 / ut2)
        return i
    elif eleccion == 6:
        while True:
            try:
                efectiva = float(input("Inserte la tasa efectiva (en porcentaje): "))
                i = efectiva / 100
                break
            except:
                print("Inserte un dato válido")
        while True:
            try:
                ut1 = int(input("Inserte la unidad de tiempo de la tasa efectiva: "))
                break
            except:
                print("Inserte un dato válido")
        while True:
            try:
                ut2 = int(input("Inserte la unidad de tiempo de la tasa nominal: "))
                break
            except:
                print("Inserte un dato válido")
        while True:
            try:
                fs = int(input("Inserte la frecuencia de subcapitalización de la tasa nominal: "))
                break
            except:
                print("Inserte un dato válido")
        jm = (ut2 / fs) * (1 - (1 - i) ** (fs / ut1))
        return jm
    elif eleccion == 7:
        while True:
            try:
                nominal = float(input("Inserte la tasa nominal (en porcentaje): "))
                jm = nominal / 100
                break
            except:
                print("Inserte un dato válido")
        while True:
            try:
                ut2 = int(input("Inserte la unidad de tiempo de la tasa nominal: "))
                break
            except:
                print("Inserte un dato válido")
        while True:
            try:
                fs = int(input("Inserte la frecuencia de subcapitalización de la tasa nominal: "))
                break
            except:
                print("Inserte un dato válido")
        while True:
            try:
                ut1 = int(input("Inserte la unidad de tiempo de la tasa efectiva: "))
                break
            except:
                print("Inserte un dato válido")
        i = 1 - (1 - (jm / ut2) * fs) ** (ut1 / fs)
        return i
    elif eleccion == 8:
        while True:
            try:
                nominal = float(input("Inserte la tasa nominal a convertir (en porcentaje): "))
                jm2 = nominal / 100
                break
            except:
                print("Inserte un dato válido")
        while True:
            try:
                ut2 = int(input("Inserte la unidad de tiempo de la tasa nominal a convertir: "))
                break
            except:
                print("Inserte un dato válido")
        while True:
            try:
                fs2 = int(input("Inserte la frecuencia de subcapitalización de la tasa nominal a convertir: "))
                break
            except:
                print("Inserte un dato válido")
        while True:
            try:
                ut1 = int(input("Inserte la unidad de tiempo de la tasa nominal resultante: "))
                break
            except:
                print("Inserte un dato válido")
        while True:
            try:
                fs1 = int(input("Inserte la frecuencia de subcapitalización de la tasa nominal resultante: "))
                break
            except:
                print("Inserte un dato válido")
        jm = (ut1 / fs1) * (1 - (1 - (jm2 / ut2) * fs2) ** (fs1 / fs2))
        return jm
    elif eleccion == 9:
        while True:
            try:
                efectiva = float(input("Inserte la tasa a convertir (en porcentaje): "))
                i2 = efectiva / 100
                break
            except:
                print("Inserte un dato válido")
        while True:
            try:
                ut2 = int(input("Inserte la unidad de tiempo de la tasa a convertir: "))
                break
            except:
                print("Inserte un dato válido")
        while True:
            try:
                ut1 = int(input("Inserte la unidad de tiempo de la tasa resultante: "))
                break
            except:
                print("Inserte un dato válido")
        i = 1 - (1 / (1 + i2)) ** (ut1 / ut2)
        return i
    elif eleccion == 10:
        while True:
            try:
                efectiva = float(input("Inserte la tasa a convertir (en porcentaje): "))
                i2 = efectiva / 100
                break
            except:
                print("Inserte un dato válido")
        while True:
            try:
                ut2 = int(input("Inserte la unidad de tiempo de la tasa a convertir: "))
                break
            except:
                print("Inserte un dato válido")
        while True:
            try:
                ut1 = int(input("Inserte la unidad de tiempo de la tasa resultante: "))
                break
            except:
                print("Inserte un dato válido")
        i = (1 / (1 - i2)) ** (ut1 / ut2) - 1
        return i
    elif eleccion == 11:
        while True:
            try:
                nominal = float(input("Inserte la tasa nominal a convertir (en porcentaje): "))
                jm2 = nominal / 100
                break
            except:
                print("Inserte un dato válido")
        while True:
            try:
                ut2 = int(input("Inserte la unidad de tiempo de la tasa nominal a convertir: "))
                break
            except:
                print("Inserte un dato válido")
        while True:
            try:
                fs2 = int(input("Inserte la frecuencia de subcapitalización de la tasa nominal a convertir: "))
                break
            except:
                print("Inserte un dato válido")
        while True:
            try:
                ut1 = int(input("Inserte la unidad de tiempo de la tasa nominal resultante: "))
                break
            except:
                print("Inserte un dato válido")
        while True:
            try:
                fs1 = int(input("Inserte la frecuencia de subcapitalización de la tasa nominal resultante: "))
                break
            except:
                print("Inserte un dato válido")
        jm = (ut1 / fs1) * (1 - (1 / (1 + (jm2 / ut2) * fs2)) ** (fs1 / fs2))
        return jm
    elif eleccion == 12:
        while True:
            try:
                nominal = float(input("Inserte la tasa nominal a convertir (en porcentaje): "))
                jm2 = nominal / 100
                break
            except:
                print("Inserte un dato válido")
        while True:
            try:
                ut2 = int(input("Inserte la unidad de tiempo de la tasa nominal a convertir: "))
                break
            except:
                print("Inserte un dato válido")
        while True:
            try:
                fs2 = int(input("Inserte la frecuencia de subcapitalización de la tasa nominal a convertir: "))
                break
            except:
                print("Inserte un dato válido")
        while True:
            try:
                ut1 = int(input("Inserte la unidad de tiempo de la tasa nominal resultante: "))
                break
            except:
                print("Inserte un dato válido")
        while True:
            try:
                fs1 = int(input("Inserte la frecuencia de subcapitalización de la tasa nominal resultante: "))
                break
            except:
                print("Inserte un dato válido")
        jm = (ut1 / fs1) * (1 / ((1 - (jm2 / ut2) * fs2) ** (fs1 / fs2)) - 1)
        return jm
    else:
        print("Por favor, inserte una opción válida")